<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Models\PageContent;
use App\Filament\Support\TranslatableTabs;
use BackedEnum;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Select;
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

    public function mount(): void
    {
        $record = PageContent::firstOrCreate(['key' => static::contentKey()], ['data' => []]);
        $data = $record->data ?? [];
        $data['watermark_enabled'] ??= true;
        $data['watermark_size'] ??= 'medium';

        $this->form->fill($data);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                Section::make('Языки сайта')
                    ->description('Снимите галочку, чтобы выключить язык: он пропадёт из переключателя на сайте, а его страницы будут открываться на русском.')
                    ->schema([
                        CheckboxList::make('enabled_locales')
                            ->hiddenLabel()
                            ->options(['kz' => 'Қазақша (KZ)', 'en' => 'English (EN)'])
                            ->helperText('Русский включён всегда — это основной язык.')
                            ->afterStateHydrated(fn (CheckboxList $component, ?array $state) => $component->state(
                                empty($state) ? ['kz', 'en'] : array_values(array_intersect($state, ['kz', 'en']))
                            ))
                            ->dehydrateStateUsing(fn (?array $state) => ['ru', ...array_values(array_intersect($state ?? [], ['kz', 'en']))])
                            ->columns(2),
                    ]),

                Section::make('Водяной знак')
                    ->description('Показывается в правом нижнем углу фото в галерее проекта и при просмотре фото на весь экран.')
                    ->columns(2)
                    ->schema([
                        Toggle::make('watermark_enabled')
                            ->label('Показывать водяной знак'),

                        Select::make('watermark_size')
                            ->label('Размер')
                            ->options(['small' => 'Маленький', 'medium' => 'Средний', 'large' => 'Большой'])
                            ->default('medium')
                            ->selectablePlaceholder(false),

                        FileUpload::make('watermark')
                            ->label('Свой файл знака')
                            ->acceptedFileTypes(['image/svg+xml', 'image/png', 'image/webp'])
                            ->directory('settings')
                            ->helperText('SVG или PNG с прозрачным фоном. Если не загружать — используется стандартный белый «© INK Architects».')
                            ->columnSpanFull(),
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
