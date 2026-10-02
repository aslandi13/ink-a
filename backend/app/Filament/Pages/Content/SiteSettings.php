<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Filament\Support\TranslatableTabs;
use BackedEnum;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class SiteSettings extends SingletonContentPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static ?string $navigationLabel = 'Настройки сайта';

    protected static ?int $navigationSort = 6;

    protected static ?string $title = 'Настройки сайта';

    public static function contentKey(): string
    {
        return 'site_settings';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                Section::make('Языки сайта')
                    ->description('Выключенный язык пропадает из переключателя на сайте, а его страницы открываются на русском.')
                    ->schema([
                        CheckboxList::make('enabled_locales')
                            ->hiddenLabel()
                            ->options(['ru' => 'Русский (RU)', 'kz' => 'Қазақша (KZ)', 'en' => 'English (EN)'])
                            ->afterStateHydrated(fn (CheckboxList $component, ?array $state) => $component->state(
                                array_values(array_unique(['ru', ...($state ?: ['kz', 'en'])]))
                            ))
                            ->disableOptionWhen(fn (string $value) => $value === 'ru')
                            ->dehydrateStateUsing(fn (?array $state) => array_values(array_unique(['ru', ...($state ?? [])])))
                            ->columns(3),
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
                            ->label('Картинка для соцсетей (OG-изображение)')
                            ->image()
                            ->directory('settings'),
                    ]),

                Section::make('Навигация')
                    ->description('Названия пунктов меню. Если оставить пустым — используются стандартные переводы.')
                    ->schema([
                        TranslatableTabs::make(fn (string $locale) => [
                            TextInput::make('nav_home')
                                ->label('Главная'),
                            TextInput::make('nav_projects')
                                ->label('Проекты'),
                            TextInput::make('nav_approach')
                                ->label('Подход'),
                            TextInput::make('nav_about')
                                ->label('О нас'),
                            TextInput::make('nav_news')
                                ->label('Новости'),
                            TextInput::make('nav_contacts')
                                ->label('Контакты'),
                        ]),
                    ]),

                Section::make('Соцсети')
                    ->schema([
                        TextInput::make('instagram')->label('Instagram')->url(),
                        TextInput::make('facebook')->label('Facebook')->url(),
                        TextInput::make('linkedin')->label('LinkedIn')->url(),
                    ])
                    ->columns(3),

                FileUpload::make('logo')
                    ->label('Логотип сайта')
                    ->image()
                    ->directory('settings')
                    ->helperText('Показывается в шапке сайта слева от меню'),

                FileUpload::make('favicon')
                    ->label('Favicon')
                    ->image()
                    ->directory('settings'),
            ]);
    }
}
