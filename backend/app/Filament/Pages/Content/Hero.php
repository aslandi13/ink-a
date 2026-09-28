<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Filament\Support\TranslatableTabs;
use App\Models\Project;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class Hero extends SingletonContentPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPhoto;

    protected static ?string $navigationLabel = 'Hero';

    protected static string|UnitEnum|null $navigationGroup = 'Главная';

    protected static ?int $navigationSort = 1;

    protected static ?string $title = 'Hero-блок';

    public static function contentKey(): string
    {
        return 'home.hero';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                // 1. Фоновое видео
                FileUpload::make('video')
                    ->label('Фоновое видео')
                    ->acceptedFileTypes(['video/mp4', 'video/webm'])
                    ->directory('home/hero')
                    ->maxSize(51200)
                    ->helperText('Видео на весь экран, проигрывается в фоне без звука. Максимум 50 МБ'),

                // 2. Бейдж проекта
                Section::make('Бейдж проекта')
                    ->description('Небольшая плашка с названием проекта в углу Hero-блока (например «Dostyk 300»), ссылается на карточку проекта')
                    ->schema([
                        Select::make('featured_project_id')
                            ->label('Проект')
                            ->options(fn () => Project::query()->get()->pluck('title', 'id')->sort())
                            ->searchable(),
                    ]),

                // 3. Постер
                FileUpload::make('poster')
                    ->label('Постер (пока видео грузится)')
                    ->image()
                    ->directory('home/hero')
                    ->imageEditor(),

                // 4. Проекты для слайдера
                Select::make('slide_project_ids')
                    ->label('Проекты для слайдера (фон Hero)')
                    ->multiple()
                    ->options(fn () => Project::query()->get()->pluck('title', 'id')->sort())
                    ->searchable()
                    ->helperText('Выберите проекты — их обложки будут циклически показываться в герое после видео'),

                // 5. Заголовок / Текст / Описание / Цифры
                TranslatableTabs::make(fn (string $locale) => [
                    Textarea::make('title')
                        ->label('Заголовок')
                        ->rows(3)
                        ->required($locale === 'ru')
                        ->helperText('Например: «Смысл. Видение. Масштаб.» — каждое предложение с новой строки'),

                    Textarea::make('subtitle')
                        ->label('Второй крупный текст')
                        ->rows(3)
                        ->helperText('Например: «45,9 миллионов квадратных метров. В зданиях. В кварталах. В городах.»'),

                    Textarea::make('description')
                        ->label('Описание (абзац)')
                        ->rows(4)
                        ->helperText('Поясняющий текст под крупными заголовками'),

                    Repeater::make('stats')
                        ->label('Цифры / статистика')
                        ->reorderable()
                        ->addActionLabel('Добавить показатель')
                        ->schema([
                            Textarea::make('number')
                                ->label('Число')
                                ->rows(1)
                                ->helperText('Например: 850+, 22 года, 12 стран / 61 город'),

                            Textarea::make('label')
                                ->label('Подпись')
                                ->rows(2)
                                ->helperText('Например: «архитектурных & инженерных проектов»'),
                        ])
                        ->columns(2)
                        ->helperText('Например: 850+ проектов, 200+ мастерпланов, 5 студий, 22 года опыта, 12 стран / 61 город, 2 млн+ жителей'),
                ]),
            ]);
    }
}
