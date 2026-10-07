<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use BackedEnum;
use UnitEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class VideoBanner extends SingletonContentPage
{
    use HomeSections;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedVideoCamera;

    protected static ?string $navigationLabel = 'Видео-баннер';

    protected static string|UnitEnum|null $navigationGroup = 'Главная';

    protected static ?int $navigationSort = 4;

    protected static ?string $title = 'Видео-баннер';

    public static function contentKey(): string
    {
        return 'home.video_banner';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                FileUpload::make('video')
                    ->label('Видеофайл')
                    ->acceptedFileTypes(['video/mp4', 'video/webm'])
                    ->directory('home/video')
                    ->maxSize(51200)
                    ->helperText('Загрузите mp4/webm. Максимум 50 МБ'),

                TextInput::make('video_url')
                    ->label('Ссылка на видео (YouTube/Vimeo)')
                    ->url()
                    ->helperText('Используется, если видеофайл не загружен'),

                FileUpload::make('poster')
                    ->label('Превью-картинка (постер)')
                    ->image()
                    ->directory('home/video')
                    ->imageEditor(),

                Repeater::make('featured_projects')
                    ->label('Проекты для слайдшоу (фото)')
                    ->helperText('Эти фото будут показаны после видео по кругу. Сначала играет видео, потом фото проектов.')
                    ->schema([
                        FileUpload::make('image')
                            ->label('Фото проекта')
                            ->image()
                            ->directory('home/slides')
                            ->imageEditor()
                            ->required(),

                        TextInput::make('name')
                            ->label('Название проекта')
                            ->placeholder('Dostyk 300')
                            ->required(),
                    ])
                    ->addActionLabel('Добавить проект')
                    ->collapsible()
                    ->reorderable()
                    ->defaultItems(0),
            ]);
    }
}
