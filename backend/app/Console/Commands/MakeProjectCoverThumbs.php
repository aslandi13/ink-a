<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Support\CoverThumb;
use Illuminate\Console\Command;

class MakeProjectCoverThumbs extends Command
{
    protected $signature = 'projects:cover-thumbs';

    protected $description = 'Create light card-size copies of project covers';

    public function handle(): int
    {
        $made = 0;

        Project::query()->whereNotNull('cover_image')->each(function (Project $project) use (&$made) {
            if (CoverThumb::make($project->cover_image)) {
                $made++;
            }
        });

        $this->info("Created {$made} cover thumbnails.");

        return self::SUCCESS;
    }
}
