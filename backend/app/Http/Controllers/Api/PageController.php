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

        return response()->json(['data' => [
            'html' => FileUrlResolver::html($page->published['html'] ?? ''),
            'css' => FileUrlResolver::html($page->published['css'] ?? ''),
        ]]);
    }
}
