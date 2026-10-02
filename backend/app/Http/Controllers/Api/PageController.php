<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Support\FileUrlResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $page = Page::where('slug', $slug)->first();

        if ($page === null || $page->published === null) {
            return response()->json(['message' => 'Page not published.'], 404);
        }

        return response()->json(['data' => $this->layout($page, 'ru')]);
    }

    public function localized(string $locale, string $slug): JsonResponse
    {
        $page = Page::isTemplate($slug) ? null : Page::where('slug', $slug)->first();

        if ($page === null || $page->published === null) {
            return response()->json(['message' => 'Page not published.'], 404);
        }

        $locale = app()->getLocale();

        return response()->json(['data' => [
            ...$this->layout($page, $locale),
            'title' => $page->localized('title', $locale),
            'seo_title' => $page->localized('seo_title', $locale),
            'seo_description' => $page->localized('seo_description', $locale),
        ]]);
    }

    public function projectTemplate(Request $request, string $locale): JsonResponse
    {
        $locale = app()->getLocale();
        $category = (string) $request->query('category', '');
        $slugs = array_filter([
            in_array($category, Page::PROJECT_CATEGORIES, true) ? Page::PROJECT_TEMPLATE.'-'.$category : null,
            Page::PROJECT_TEMPLATE,
        ]);

        foreach ($slugs as $slug) {
            $page = Page::where('slug', $slug)->whereNotNull('published_at')->first();
            if ($page !== null && $page->published !== null) {
                return response()->json(['data' => $this->layout($page, $locale)]);
            }
        }

        return response()->json(['message' => 'No template.'], 404);
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

    private function layout(Page $page, string $locale): array
    {
        $layout = Page::layoutFor($page->published, $locale) ?? [];

        return [
            'html' => FileUrlResolver::html($layout['html'] ?? ''),
            'css' => FileUrlResolver::html($layout['css'] ?? ''),
        ];
    }
}
