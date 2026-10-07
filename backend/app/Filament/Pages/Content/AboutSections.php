<?php

namespace App\Filament\Pages\Content;

use App\Filament\Resources\TeamMembers\TeamMemberResource;

trait AboutSections
{
    public static function sectionTabs(): array
    {
        return [
            AboutHistory::class => 'История',
            TeamMemberResource::class => 'Команда',
            AboutFounder::class => 'Об основателе',
        ];
    }

    public static function sectionGroupTitle(): ?string
    {
        return 'О нас';
    }
}
