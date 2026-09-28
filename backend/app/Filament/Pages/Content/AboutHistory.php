<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Filament\Support\TranslatableTabs;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class AboutHistory extends SingletonContentPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClock;

    protected static ?string $navigationLabel = 'История';

    protected static string|UnitEnum|null $navigationGroup = 'О нас';

    protected static ?int $navigationSort = 1;

    protected static ?string $title = 'История компании';

    public static function contentKey(): string
    {
        return 'about.history';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                Section::make('Фотоколлаж')
                    ->description('Несколько ячеек в ряд наверху страницы. Ячейка может быть фото, либо просто текстом на тёмном фоне без фото — оставьте поле «Фото» пустым')
                    ->schema([
                        Repeater::make('gallery')
                            ->label('Ячейки')
                            ->reorderable()
                            ->addActionLabel('Добавить ячейку')
                            ->schema([
                                FileUpload::make('image')
                                    ->label('Фото')
                                    ->image()
                                    ->directory('about/history')
                                    ->imageEditor()
                                    ->helperText('Оставьте пустым для текстовой ячейки без фото'),

                                TextInput::make('overlay_text')
                                    ->label('Текст')
                                    ->helperText('Если есть фото — текст ляжет поверх него. Если фото нет — это самостоятельная текстовая плашка. Например: «Проект рождается в команде»'),
                            ])
                            ->columns(2),
                    ]),

                TranslatableTabs::make(fn (string $locale) => [
                    Textarea::make('intro')
                        ->label('Вступительный абзац')
                        ->rows(3)
                        ->required($locale === 'ru')
                        ->helperText('Например: «INK Architects — международное архитектурное бюро, основанное Нурланом Камитовым в 2004 году...»'),

                    Repeater::make('stats')
                        ->label('Цифры / статистика')
                        ->reorderable()
                        ->addActionLabel('Добавить показатель')
                        ->schema([
                            TextInput::make('number')
                                ->label('Число')
                                ->required()
                                ->helperText('Например: 2004, 12, 61, 5'),

                            TextInput::make('label')
                                ->label('Подпись')
                                ->required()
                                ->helperText('Например: «Год основания», «Стран проектной практики»'),
                        ])
                        ->columns(2),

                    Repeater::make('highlights')
                        ->label('Текстовые блоки справа')
                        ->reorderable()
                        ->addActionLabel('Добавить блок')
                        ->itemLabel(fn (array $state): ?string => $state['heading'] ?? null)
                        ->schema([
                            TextInput::make('heading')
                                ->label('Заголовок')
                                ->required()
                                ->helperText('Например: «Масштаб проектирования»'),

                            Textarea::make('text')
                                ->label('Текст')
                                ->rows(3)
                                ->required(),
                        ]),
                ]),

                Section::make('SEO')
                    ->description('Отображается в поисковых системах и при шаринге ссылки')
                    ->schema([
                        TranslatableTabs::make(fn (string $locale) => [
                            TextInput::make('seo_title')
                                ->label('SEO-заголовок'),

                            Textarea::make('seo_description')
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
