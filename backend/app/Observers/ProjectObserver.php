<?php

namespace App\Observers;

use App\Models\Project;
use App\Support\GalleryWatermark;

class ProjectObserver
{
    public function saved(Project $project): void
    {
        $gallery = $project->gallery ?? [];
        $processed = array_map(fn (string $path) => GalleryWatermark::process($path), $gallery);

        if ($processed !== $gallery) {
            $project->gallery = $processed;
            $project->saveQuietly();
        }
    }
}
