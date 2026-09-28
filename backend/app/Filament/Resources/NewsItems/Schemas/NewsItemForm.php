<?php

namespace App\Filament\Resources\NewsItems\Schemas;

use App\Filament\Support\TranslatableTabs;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Utilities\Set;
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

                TextInput::make('slug')
                    ->label('URL-адрес (slug)')
                    ->required()
                    ->unique(ignoreRecord: true),

                FileUpload::make('cover_image')
                    ->label('Обложка')
                    ->image()
                    ->directory('news')
                    ->imageEditor()
                    ->helperText('Перетащите изображение или выберите файл'),

                DateTimePicker::make('published_at')
                    ->label('Дата публикации')
                    ->default(now())
                    ->helperText('Дата отображается на сайте'),

                TextInput::make('sort_order')
                    ->label('Порядок сортировки')
                    ->numeric()
                    ->default(0)
                    ->helperText('Чем меньше число — тем выше в списке'),

                Toggle::make('is_published')
                    ->label('Опубликована')
                    ->default(true),
            ]);
    }
}
