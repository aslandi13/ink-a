<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Filament\Support\TranslatableTabs;
use BackedEnum;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class KeyProjects extends SingletonContentPage
{
    use HomeSections;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedStar;

    protected static ?string $navigationLabel = 'Ключевые проекты';

    protected static string|UnitEnum|null $navigationGroup = 'Главная';

    protected static ?int $navigationSort = 5;

    protected static ?string $title = 'Ключевые проекты на главной';

    public static function contentKey(): string
    {
        return 'home.key_projects';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                TranslatableTabs::make(fn (string $locale) => [
                    Textarea::make('heading')
                        ->label('Заголовок')
                        ->rows(1)
                        ->required($locale === 'ru')
                        ->helperText('Например: «Ключевые проекты»'),

                    Textarea::make('statement')
                        ->label('Крупный текст-утверждение')
                        ->rows(2)
                        ->helperText('Например: «Более 45,9 миллионов квадратных метров: от отдельной башни до целого района»'),

                    Textarea::make('description')
                        ->label('Описание')
                        ->rows(3)
                        ->helperText('Например: «INK работает с проектом как с частью города: проверяет посадку, силуэт, функцию, фасад, инженерную логику и сценарии жизни...»'),
                ]),
            ]);
    }
}
