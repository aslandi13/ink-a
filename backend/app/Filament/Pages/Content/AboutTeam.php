<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Filament\Support\TranslatableTabs;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class AboutTeam extends SingletonContentPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUserGroup;

    protected static ?string $navigationLabel = 'Команда';

    protected static string|UnitEnum|null $navigationGroup = 'О нас';

    protected static ?int $navigationSort = 2;

    protected static ?string $title = 'Команда — SEO';

    protected static bool $shouldRegisterNavigation = false;

    public static function contentKey(): string
    {
        return 'about.team';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                Section::make('SEO')
                    ->description('Отображается в поисковых системах и при шаринге ссылки')
                    ->schema([
                        TranslatableTabs::make(fn (string $locale) => [
                            TextInput::make('seo_title')
                                ->label('SEO-заголовок'),

                            \Filament\Forms\Components\Textarea::make('seo_description')
                                ->label('SEO-описание')
                                ->rows(3),
                        ]),

                        FileUpload::make('og_image')
                            ->label('OG-изображение для соцсетей')
                            ->image()
                            ->directory('seo'),
                    ]),
            ]);
    }
}
