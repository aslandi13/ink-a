<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\FileUrlResolver;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)->first();

        if ($page === null || $page->published === null) {
            return response()->json(['message' => 'Page not published.'], 404);
        }

        return response()->json(['data' => $this->layout($page)]);
    }

    public function localized(string $locale, string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)->first();

        if ($page === null || $page->published === null) {
            return response()->json(['message' => 'Page not published.'], 404);
        }

        $locale = app()->getLocale();

        return response()->json(['data' => [
            ...$this->layout($page),
            'title' => $page->localized('title', $locale),
            'seo_title' => $page->localized('seo_title', $locale),
            'seo_description' => $page->localized('seo_description', $locale),
        ]]);
    }

    public function menu(string $locale): JsonResponse
    {
        $locale = app()->getLocale();

        $pages = Page::query()
            ->where('show_in_menu', true)
            ->whereNotNull('published_at')
            ->where('slug', '!=', Page::HOME)
            ->orderBy('menu_order')
            ->get()
            ->map(fn (Page $page) => [
                'slug' => $page->slug,
                'title' => $page->localized('title', $locale) ?? $page->slug,
            ]);

        return response()->json(['data' => $pages]);
    }

    private function layout(Page $page): array
    {
        return [
            'html' => FileUrlResolver::html($page->published['html'] ?? ''),
            'css' => FileUrlResolver::html($page->published['css'] ?? ''),
        ];
    }
}
