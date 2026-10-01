<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\User;
use App\Support\FileUrlResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

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

    public function show(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)->first();
        $draft = $page?->draft;

        if (is_array($draft)) {
            $draft['html'] = FileUrlResolver::html($draft['html'] ?? '');
            $draft['css'] = FileUrlResolver::html($draft['css'] ?? '');
        }

        return response()->json(['data' => [
            'draft' => $draft,
            'published_at' => $page?->published_at,
        ]]);
    }

    public function update(Request $request, string $slug): JsonResponse
    {
        $data = $request->validate([
            'project' => ['required', 'array'],
            'html' => ['present', 'nullable', 'string'],
            'css' => ['present', 'nullable', 'string'],
        ]);

        $page = Page::updateOrCreate(['slug' => $slug], ['draft' => $data]);

        return response()->json(['data' => ['updated_at' => $page->updated_at]]);
    }

    public function publish(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)->first();

        if ($page === null || $page->draft === null) {
            return response()->json(['message' => 'Сначала сохраните черновик.'], 422);
        }

        $page->update(['published' => $page->draft, 'published_at' => now()]);

        return response()->json(['data' => ['published_at' => $page->published_at]]);
    }

    public function unpublish(string $slug): JsonResponse
    {
        Page::where('slug', $slug)->update(['published' => null, 'published_at' => null]);

        return response()->json(['data' => ['published_at' => null]]);
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
