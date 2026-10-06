<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Support\GalleryWatermark;
use Illuminate\Console\Command;

class WatermarkProjectGalleries extends Command
{
    protected $signature = 'projects:watermark-galleries';

    protected $description = 'Create clean thumbnails and stamp the watermark on project gallery photos that are not processed yet';

    public function handle(): int
    {
        $done = 0;

        Project::query()->each(function (Project $project) use (&$done) {
            $gallery = $project->gallery ?? [];
            $pending = array_filter($gallery, fn (string $path) => ! GalleryWatermark::isProcessed($path));

            if ($pending === []) {
                return;
            }

            $project->gallery = array_map(fn (string $path) => GalleryWatermark::process($path), $gallery);
            $project->saveQuietly();
            $count = count(array_filter($project->gallery, fn (string $path) => GalleryWatermark::isProcessed($path))) - (count($gallery) - count($pending));
            $done += $count;
            $this->line("{$project->slug}: {$count} из ".count($pending));
        });

        $this->info("Обработано фото: {$done}");

        return self::SUCCESS;
    }
}
