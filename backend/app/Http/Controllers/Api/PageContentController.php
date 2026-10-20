<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use App\Models\TeamMember;
use App\Support\FileUrlResolver;
use App\Support\LocaleResolver;
use App\Support\SharedImages;
use Illuminate\Http\JsonResponse;

class PageContentController extends Controller
{
    public function __invoke(string $locale, string $key): JsonResponse
    {
        $record = PageContent::where('key', $key)->first();

        if ($record === null) {
            return response()->json(['message' => 'Page content not found.'], 404);
        }

        $data = LocaleResolver::resolve(SharedImages::apply($key, $record->data ?? []), app()->getLocale());
        $data = FileUrlResolver::resolve($data);

        if ($key === 'about.team') {
            $data['members'] = TeamMember::query()
                ->where('is_published', true)
                ->orderBy('sort_order')
                ->get()
                ->map(fn (TeamMember $member) => [
                    'name' => $member->getTranslation('name', $locale, false) ?: $member->getTranslation('name', 'ru', false),
                    'photo' => FileUrlResolver::resolve($member->photo),
                    'position' => $member->getTranslation('position', $locale, false) ?: $member->getTranslation('position', 'ru', false),
                    'credentials' => $member->getTranslation('credentials', $locale, false) ?: $member->getTranslation('credentials', 'ru', false),
                ])
                ->all();
        }

        if ($key === 'home.hero') {
            unset($data['slide_project_ids']);
            $data['slides'] = collect($data['hero_slides'] ?? [])
                ->filter(fn ($slide) => is_array($slide) && filled($slide['image'] ?? null))
                ->map(fn (array $slide) => ['image' => $slide['image'], 'title' => $slide['caption'] ?? null])
                ->values()
                ->all();
            unset($data['hero_slides']);
        }

        return response()->json(['data' => $data]);
    }
}

