<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Filament\Support\TranslatableTabs;
use BackedEnum;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class Legal extends SingletonContentPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentText;

    protected static ?string $navigationLabel = 'Правовая информация';

    protected static ?int $navigationSort = 7;

    protected static ?string $title = 'Правовая информация и условия использования';

    public static function contentKey(): string
    {
        return 'legal';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                TranslatableTabs::make(fn (string $locale) => [
                    TextInput::make('title')
                        ->label('Заголовок страницы')
                        ->helperText('Если пусто — «Правовая информация и условия использования»'),

                    RichEditor::make('body')
                        ->label('Текст страницы')
                        ->required($locale === 'ru')
                        ->resizableImages()
                        ->helperText('Полный текст условий использования — разделы «Введение», «Интеллектуальная собственность» и т.д. можно оформить обычными заголовками и абзацами'),
                ]),
            ]);
    }
}
