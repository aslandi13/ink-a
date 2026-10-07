<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PageContent;
use App\Models\Project;
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
                    'name' => $member->name,
                    'photo' => FileUrlResolver::resolve($member->photo),
                    'position' => $member->getTranslation('position', $locale, false) ?: $member->getTranslation('position', 'ru', false),
                    'credentials' => $member->getTranslation('credentials', $locale, false) ?: $member->getTranslation('credentials', 'ru', false),
                ])
                ->all();
        }

        // Обогащение: slide_project_ids → slides с cover_image (для любого блока)
        if (!empty($data['slide_project_ids'])) {
            $ids = array_values(array_map('intval', (array) $data['slide_project_ids']));
            $projects = Project::whereIn('id', $ids)
                ->get(['id', 'cover_image', 'title', 'slug', 'category'])
                ->keyBy('id');

            $data['slides'] = collect($ids)
                ->filter(fn ($id) => isset($projects[$id]) && $projects[$id]->cover_image)
                ->map(fn ($id) => [
                    'image' => FileUrlResolver::resolve($projects[$id]->cover_image),
                    'title' => $projects[$id]->getTranslation('title', $locale, false) ?: $projects[$id]->getTranslation('title', 'ru', false),
                    'slug'  => $projects[$id]->slug,
                    'category' => $projects[$id]->category,
                ])
                ->values()
                ->toArray();
        }

        return response()->json(['data' => $data]);
    }
}

