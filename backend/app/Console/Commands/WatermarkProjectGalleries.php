<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Support\GalleryWatermark;
use Illuminate\Console\Command;

class WatermarkProjectGalleries extends Command
{
    protected $signature = 'projects:watermark-galleries';

    protected $description = 'Create clean thumbnails and stamp the watermark on project gallery photos that do not have it yet';

    public function handle(): int
    {
        $stamped = 0;

        Project::query()->each(function (Project $project) use (&$stamped) {
            $gallery = $project->gallery ?? [];
            $pending = array_values(array_filter($gallery, fn (string $path) => ! GalleryWatermark::isStamped($path)));

            if ($pending === []) {
                return;
            }

            $project->gallery = array_map(fn (string $path) => GalleryWatermark::stampExisting($path), $gallery);
            $project->saveQuietly();

            $count = count(array_filter($project->gallery, fn (string $path) => GalleryWatermark::isStamped($path))) - (count($gallery) - count($pending));
            $stamped += $count;
            $this->line("{$project->slug}: {$count} из ".count($pending));
        });

        $this->info("Фото со знаком: {$stamped}");

        if ($stamped === 0) {
            $this->warn('Если ожидались фото — проверьте, что в «Настройках сайта» водяной знак включён.');
        }

        return self::SUCCESS;
    }
}
