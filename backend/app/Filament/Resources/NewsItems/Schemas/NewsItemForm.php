<?php

namespace App\Filament\Resources\NewsItems\Schemas;

use App\Filament\Support\TranslatableTabs;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Hidden;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class NewsItemForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TranslatableTabs::make(fn (string $locale) => [
                    TextInput::make('title')
                        ->label('Заголовок')
                        ->required($locale === 'ru')
                        ->live(onBlur: true)
                        ->afterStateUpdated(function ($state, Set $set) use ($locale) {
                            if ($locale === 'ru') {
                                $set('data.slug', Str::slug($state), isAbsolute: true);
                            }
                        }),

                    Textarea::make('excerpt')
                        ->label('Краткое описание')
                        ->rows(3)
                        ->helperText('Показывается в списке новостей'),

                    RichEditor::make('body')
                        ->label('Текст новости')
                        ->resizableImages(),
                ]),

                Grid::make(2)
                    ->columnSpanFull()
                    ->schema([
                        Group::make([
                            TextInput::make('slug')
                                ->label('URL-адрес (slug)')
                                ->required()
                                ->unique(ignoreRecord: true),

                            DateTimePicker::make('published_at')
                                ->label('Дата публикации')
                                ->default(now())
                                ->helperText('Дата отображается на сайте'),
                        ]),

                        FileUpload::make('cover_image')
                            ->label('Обложка')
                            ->image()
                            ->directory('news')
                            ->imageEditor()
                            ->helperText('Перетащите изображение или выберите файл'),
                    ]),

                Hidden::make('is_published')
                    ->default(true),
            ]);
    }
}
