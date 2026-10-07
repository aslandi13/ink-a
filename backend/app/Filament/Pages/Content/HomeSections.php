<?php

namespace App\Filament\Pages\Content;

trait HomeSections
{
    public static function sectionTabs(): array
    {
        return [
            Hero::class => 'Hero',
            AboutBlock::class => 'О нас',
            Offices::class => 'Наши офисы',
            VideoBanner::class => 'Видео-баннер',
            KeyProjects::class => 'Ключевые проекты',
        ];
    }

    public static function sectionGroupTitle(): ?string
    {
        return 'Главная';
    }
}
