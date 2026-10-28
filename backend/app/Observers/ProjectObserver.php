<?php

namespace App\Observers;

use App\Models\Project;
use App\Support\CoverThumb;
use App\Support\GalleryWatermark;
use App\Support\WebImage;

class ProjectObserver
{
    public function saved(Project $project): void
    {
        CoverThumb::make($project->cover_image);

        $gallery = $project->gallery ?? [];
        $processed = array_map(fn (string $path) => GalleryWatermark::process($path), $gallery);

        if ($processed !== $gallery) {
            $project->gallery = $processed;
            $project->saveQuietly();
        }

        WebImage::make($project->cover_image);
        WebImage::makeAll($processed);
    }
}
