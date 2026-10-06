<?php

namespace App\Filament\Resources\Projects\Schemas;

use App\Filament\Support\TranslatableTabs;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Unique;

class ProjectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TranslatableTabs::make(fn (string $locale) => [
                    TextInput::make('title')
                        ->label('Название проекта')
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
                        ->helperText('Показывается в карточке проекта в списке'),

                    RichEditor::make('body')
                        ->label('Полное описание')
                        ->resizableImages(),
                ]),

                TextInput::make('slug')
                    ->label('URL-адрес (slug)')
                    ->required()
                    ->unique(ignoreRecord: true, modifyRuleUsing: fn (Unique $rule, Get $get) => $rule->where('category', $get('category')))
                    ->validationMessages(['unique' => 'В этой категории уже есть проект с таким адресом.'])
                    ->helperText('Используется в адресе страницы после категории, например: /projects/architecture/villa-on-the-hill. В разных категориях адрес может повторяться.'),

                Select::make('category')
                    ->label('Категория')
                    ->required()
                    ->default(fn () => in_array(request()->query('category'), ['architecture', 'engineering', 'urbanism', 'interior'], true) ? request()->query('category') : null)
                    ->options([
                        'architecture' => 'Архитектура',
                        'engineering' => 'Рабочее проектирование',
                        'urbanism' => 'Урбанистика и мастерпланирование',
                        'interior' => 'Дизайн интерьера',
                    ]),

                FileUpload::make('cover_image')
                    ->label('Обложка')
                    ->image()
                    ->directory('projects')
                    ->imageEditor()
                    ->helperText('Перетащите изображение или выберите файл. Рекомендуемое соотношение — 16:9.'),

                Select::make('cover_focus')
                    ->label('Фокус обложки на мобильном')
                    ->helperText('Какую часть фото сохранять при обрезке на телефоне.')
                    ->options([
                        'center' => 'По центру',
                        'left' => 'Левее',
                        'right' => 'Правее',
                        'top' => 'Верх',
                        'bottom' => 'Низ',
                    ])
                    ->default('center')
                    ->native(false),

                FileUpload::make('gallery')
                    ->label('Фотогалерея')
                    ->image()
                    ->multiple()
                    ->reorderable()
                    ->directory('projects/gallery')
                    ->helperText('Эти же фото используются и в слайдере наверху страницы проекта, и в сетке ниже описания'),

                Section::make('Параметры проекта')
                    ->columns(2)
                    ->schema([
                        TextInput::make('location')
                            ->label('Местоположение')
                            ->helperText('Например: Astana, Kazakhstan'),

                        TextInput::make('year')
                            ->label('Год')
                            ->numeric()
                            ->minValue(1900)
                            ->maxValue(2100),

                        TextInput::make('site_area')
                            ->label('Площадь участка')
                            ->helperText('Например: 0,30 ha'),

                        TextInput::make('total_area')
                            ->label('Общая площадь')
                            ->helperText('Например: 17 102 m²'),

                        TextInput::make('total_apartments')
                            ->label('Количество квартир')
                            ->helperText('Например: 240'),

                        Select::make('status')
                            ->label('Статус')
                            ->options([
                                'completed' => 'Completed',
                                'in_progress' => 'Construction',
                                'concept' => 'Concept',
                            ]),
                    ]),

                TextInput::make('sort_order')
                    ->label('Порядок сортировки')
                    ->numeric()
                    ->default(0)
                    ->helperText('Чем меньше число, тем выше проект в списке'),

                Toggle::make('is_published')
                    ->label('Опубликован')
                    ->default(true),
            ]);
    }
}
