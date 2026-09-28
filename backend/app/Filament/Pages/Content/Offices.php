<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Filament\Support\TranslatableTabs;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class Offices extends SingletonContentPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingOffice2;

    protected static ?string $navigationLabel = 'Наши офисы';

    protected static string|UnitEnum|null $navigationGroup = 'Главная';

    protected static ?int $navigationSort = 3;

    protected static ?string $title = 'География проектов / Наши офисы';

    public static function contentKey(): string
    {
        return 'home.offices';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                TranslatableTabs::make(fn (string $locale) => [
                    TextInput::make('heading')
                        ->label('Заголовок')
                        ->required($locale === 'ru')
                        ->helperText('Например: «География проектов»'),

                    Textarea::make('description')
                        ->label('Текст')
                        ->rows(3)
                        ->helperText('Например: «От СНГ и Ближнего востока до Майами. INK работает в разных нормативных и культурных средах. География меняется. Проектная система остаётся единой.»'),

                    TextInput::make('video_label')
                        ->label('Метка над видео')
                        ->helperText('Например: «Наши офисы» — показывается прямо над видео с картой'),
                ]),

                FileUpload::make('map_video')
                    ->label('Видео с картой')
                    ->acceptedFileTypes(['video/mp4', 'video/webm'])
                    ->directory('home/offices')
                    ->maxSize(51200)
                    ->helperText('Анимация карты с городами (на сайте — ролик с таймлайном, например 1:14). Максимум 50 МБ'),

                FileUpload::make('map_poster')
                    ->label('Постер (пока видео грузится)')
                    ->image()
                    ->directory('home/offices')
                    ->imageEditor(),
            ]);
    }
}
