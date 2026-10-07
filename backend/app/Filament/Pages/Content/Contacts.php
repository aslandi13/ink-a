<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Filament\Support\TranslatableTabs;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class Contacts extends SingletonContentPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedMapPin;

    protected static ?string $navigationLabel = 'Контакты';

    protected static ?int $navigationSort = 5;

    protected static ?string $title = 'Контакты';

    public static function contentKey(): string
    {
        return 'contacts';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                FileUpload::make('background_video')
                    ->label('Фоновое видео / изображение')
                    ->directory('contacts')
                    ->maxSize(51200)
                    ->helperText('Можно загрузить видео (mp4) или обычную картинку. Максимум 50 МБ'),

                FileUpload::make('background_poster')
                    ->label('Постер (пока видео грузится)')
                    ->image()
                    ->directory('contacts')
                    ->helperText('Картинка, которая видна до загрузки видео. Лучше взять кадр из самого видео.'),

                Section::make('Социальные сети')
                    ->description('Показываются вверху страницы с иконкой, юзернеймом и подписью платформы')
                    ->columns(2)
                    ->schema([
                        TextInput::make('email')
                            ->label('Email')
                            ->email()
                            ->columnSpanFull()
                            ->helperText('Например: info@ink-a.com'),

                        TextInput::make('facebook_handle')
                            ->label('Facebook — юзернейм')
                            ->helperText('Например: @ink.arch'),
                        TextInput::make('facebook_url')
                            ->label('Facebook — ссылка')
                            ->url(),

                        TextInput::make('instagram_handle')
                            ->label('Instagram — юзернейм')
                            ->helperText('Например: @inkarchitects'),
                        TextInput::make('instagram_url')
                            ->label('Instagram — ссылка')
                            ->url(),

                        TextInput::make('linkedin_handle')
                            ->label('LinkedIn — юзернейм')
                            ->helperText('Например: @ink-architects'),
                        TextInput::make('linkedin_url')
                            ->label('LinkedIn — ссылка')
                            ->url(),
                    ]),

                Section::make('Блок «Карьера»')
                    ->schema([
                        TranslatableTabs::make(fn (string $locale) => [
                            TextInput::make('career_label')
                                ->label('Метка над заголовком')
                                ->helperText('Например: «Карьера»'),

                            Textarea::make('career_heading')
                                ->label('Заголовок')
                                ->rows(2)
                                ->helperText('Например: «Станьте частью INK Architects»'),

                            Textarea::make('career_text')
                                ->label('Текст')
                                ->rows(3)
                                ->helperText('Например: «Мы ищем архитекторов, инженеров, дизайнеров и других специалистов, которые хотят создавать значимые пространства вместе с нами.»'),

                            TextInput::make('career_cta_label')
                                ->label('Текст кнопки')
                                ->helperText('Например: «Оставить заявку»'),
                        ]),

                        TextInput::make('career_cta_url')
                            ->label('Ссылка кнопки')
                            ->helperText('Например, ссылка на форму или email для отклика'),
                    ]),

                Section::make('Адрес и связь')
                    ->columns(2)
                    ->schema([
                        TextInput::make('address')
                            ->label('Адрес'),

                        TextInput::make('phone')
                            ->label('Телефон')
                            ->tel(),

                        TextInput::make('whatsapp')
                            ->label('WhatsApp')
                            ->helperText('Номер в международном формате, например +7 700 000 00 00'),

                        TextInput::make('map_embed_url')
                            ->label('Ссылка на карту (embed)')
                            ->url()
                            ->helperText('URL для встраивания Google/Yandex карты в iframe'),
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
