<?php

namespace App\Console\Commands;

use App\Models\NewsItem;
use App\Models\PageContent;
use App\Models\Project;
use App\Models\TeamMember;
use App\Support\CoverThumb;
use App\Support\WebImage;
use Illuminate\Console\Command;

class MakeWebImages extends Command
{
    protected $signature = 'images:web';

    protected $description = 'Create 1920px web copies of large site images';

    public function handle(): int
    {
        $made = 0;

        Project::query()->each(function (Project $project) use (&$made) {
            $made += WebImage::makeAll([$project->cover_image, $project->gallery ?? []]);
        });
        PageContent::query()->each(function (PageContent $content) use (&$made) {
            $made += WebImage::makeAll($content->data ?? []);
        });
        NewsItem::query()->each(function (NewsItem $item) use (&$made) {
            $made += WebImage::makeAll($item->cover_image);
            $made += CoverThumb::make($item->cover_image) ? 1 : 0;
        });
        TeamMember::query()->each(function (TeamMember $member) use (&$made) {
            $made += WebImage::makeAll($member->photo);
        });

        $this->info("Created {$made} web images.");

        return self::SUCCESS;
    }
}
