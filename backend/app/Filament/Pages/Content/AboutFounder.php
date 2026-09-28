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

class AboutFounder extends SingletonContentPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUser;

    protected static ?string $navigationLabel = 'Об основателе';

    protected static string|UnitEnum|null $navigationGroup = 'О нас';

    protected static ?int $navigationSort = 3;

    protected static ?string $title = 'Об основателе';

    public static function contentKey(): string
    {
        return 'about.founder';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                FileUpload::make('photo')
                    ->label('Фото')
                    ->image()
                    ->directory('about/founder')
                    ->imageEditor(),

                TextInput::make('name')
                    ->label('Имя')
                    ->required()
                    ->helperText('Например: Нурлан Камитов — имя не переводится, указывается один раз'),

                TranslatableTabs::make(fn (string $locale) => [
                    TextInput::make('position')
                        ->label('Должность')
                        ->required($locale === 'ru')
                        ->helperText('Например: «Основатель и главный архитектор INK Architects»'),

                    Repeater::make('achievements')
                        ->label('Регалии (список)')
                        ->reorderable()
                        ->addActionLabel('Добавить пункт')
                        ->simple(
                            TextInput::make('text')
                                ->required()
                                ->helperText('Например: «Дипломированный член Королевского института британских архитекторов (Chartered Member RIBA)»')
                        ),

                    Textarea::make('bio')
                        ->label('Биография (абзац)')
                        ->rows(4)
                        ->helperText('Например: «Нурлан Камитов основал INK Architects в 2004 году и сформировал бюро как международный проектный институт полного цикла...»'),

                    Section::make('Пояснения к регалиям')
                        ->description('Три колонки: иконка/логотип + поясняющий текст (RIBA, AIA, IAA и т.п.)')
                        ->schema([
                            Repeater::make('credential_highlights')
                                ->label('Колонки')
                                ->reorderable()
                                ->addActionLabel('Добавить колонку')
                                ->schema([
                                    FileUpload::make('icon')
                                        ->label('Иконка / логотип')
                                        ->image()
                                        ->directory('about/founder'),

                                    Textarea::make('text')
                                        ->label('Текст')
                                        ->rows(4)
                                        ->required(),
                                ])
                                ->columns(2),
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
