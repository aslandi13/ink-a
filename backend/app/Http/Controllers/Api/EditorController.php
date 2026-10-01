<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\User;
use App\Support\EditableContent;
use App\Support\FileUrlResolver;
use App\Support\Locales;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use InvalidArgumentException;

class EditorController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if ($user === null || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Неверный email или пароль.'], 422);
        }

        return response()->json([
            'token' => $user->createToken('page-editor', ['page-editor'], now()->addDays(7))->plainTextToken,
            'name' => $user->name,
        ]);
    }

    public function show(Request $request, string $slug): JsonResponse
    {
        $locale = $this->locale($request);
        $page = Page::where('slug', $slug)->first();

        if ($page === null && $slug !== Page::HOME) {
            return response()->json(['message' => 'Страница не найдена. Создайте её в админке.'], 404);
        }

        $layouts = Page::normalizeLayouts($page?->draft);
        $draft = $layouts[$locale] ?? $layouts['ru'] ?? null;

        if (is_array($draft)) {
            $draft['html'] = FileUrlResolver::html($draft['html'] ?? '');
            $draft['css'] = FileUrlResolver::html($draft['css'] ?? '');
        }

        return response()->json(['data' => [
            'draft' => $draft,
            'inherited' => $draft !== null && ! isset($layouts[$locale]),
            'title' => $page?->localized('title', 'ru') ?? $slug,
            'published_at' => $page?->published_at,
        ]]);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        $locale = $this->locale($request);
        $data = $request->validate([
            'project' => ['required', 'array'],
            'html' => ['present', 'nullable', 'string'],
            'css' => ['present', 'nullable', 'string'],
        ]);

        if ($slug !== Page::HOME && ! Page::where('slug', $slug)->exists()) {
            return response()->json(['message' => 'Страница не найдена.'], 404);
        }

        $page = Page::firstOrNew(['slug' => $slug]);
        $layouts = Page::normalizeLayouts($page->draft);
        $layouts[$locale] = $data;
        $page->draft = $layouts;
        $page->save();

        return response()->json(['data' => ['updated_at' => $page->updated_at]]);
    }

    public function content(Request $request): JsonResponse
    {
        $data = $request->validate([
            'locale' => ['required', Rule::in(array_keys(Locales::SUPPORTED))],
            'changes' => ['required', 'array', 'max:200'],
            'changes.*.key' => ['required', 'string'],
            'changes.*.field' => ['required', 'string', 'max:100'],
            'changes.*.value' => ['present', 'nullable', 'string', 'max:20000'],
        ]);

        try {
            EditableContent::apply($data['locale'], $data['changes']);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => ['saved' => count($data['changes'])]]);
    }

    public function publish(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)->first();

        if ($page === null || $page->draft === null) {
            return response()->json(['message' => 'Сначала сохраните черновик.'], 422);
        }

        $page->update(['published' => Page::normalizeLayouts($page->draft), 'published_at' => now()]);

        return response()->json(['data' => ['published_at' => $page->published_at]]);
    }

    public function unpublish(string $slug): JsonResponse
    {
        Page::where('slug', $slug)->update(['published' => null, 'published_at' => null]);

        return response()->json(['data' => ['published_at' => null]]);
    }

    private function locale(Request $request): string
    {
        $locale = (string) $request->query('locale', 'ru');

        return array_key_exists($locale, Locales::SUPPORTED) ? $locale : 'ru';
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'files' => ['required', 'array'],
            'files.*' => ['file', 'max:51200', 'mimes:jpg,jpeg,png,webp,avif,gif,svg,mp4,webm,mov'],
        ]);

        $urls = collect($request->file('files'))
            ->map(fn ($file) => Storage::disk('public')->url($file->store('editor', 'public')))
            ->values();

        return response()->json(['data' => $urls]);
    }
}
