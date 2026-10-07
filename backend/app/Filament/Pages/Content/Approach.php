<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Filament\Support\TranslatableTabs;
use App\Support\SharedImages;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class Approach extends SingletonContentPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedLightBulb;

    protected static ?string $navigationLabel = 'Подход';

    protected static ?int $navigationSort = 2;

    protected static ?string $title = 'Страница «Подход»';

    /**
     * Same 4 categories as Projects — the Approach page shows separate
     * content (expertise text + N process steps, each with its own photo)
     * per category tab.
     *
     * @var array<string, string>
     */
    public const CATEGORIES = [
        'architecture' => 'Архитектура',
        'engineering' => 'Рабочее проектирование',
        'urbanism' => 'Урбанистика и мастерпланирование',
        'interior' => 'Дизайн интерьера',
    ];

    public static function contentKey(): string
    {
        return 'approach';
    }

    public static function prepareData(array $data): array
    {
        return SharedImages::apply('approach', $data);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                Tabs::make('Категория')
                    ->tabs(
                        collect(self::CATEGORIES)
                            ->map(fn (string $label, string $category) => Tab::make($label)
                                ->schema([
                                    Group::make(self::categoryFields())
                                        ->statePath($category),
                                ]))
                            ->values()
                            ->all()
                    ),
            ]);
    }

    /**
     * @return array<int, \Filament\Schemas\Components\Component>
     */
    protected static function categoryFields(): array
    {
        return [
            FileUpload::make('default_image')
                ->label('Общее фото (пока ни один шаг не открыт)')
                ->image()
                ->directory('approach')
                ->imageEditor(),

            TextInput::make('default_image_caption')
                ->label('Подпись к общему фото')
                ->helperText('Например: «Концепт бизнес-центра»'),

            TranslatableTabs::make(fn (string $locale) => [
                Textarea::make('expertise_intro')
                    ->label('Текст блока «Экспертиза»')
                    ->rows(4)
                    ->helperText('Два абзаца, например: «INK работает генеральным проектировщиком...» + «Архитектура, конструктив и инженерные разделы...»'),

                Repeater::make('steps')
                    ->label('Шаги процесса')
                    ->reorderable()
                    ->addActionLabel('Добавить шаг')
                    ->itemLabel(fn (array $state): ?string => $state['title'] ?? null)
                    ->schema([
                        TextInput::make('title')
                            ->label('Заголовок')
                            ->required()
                            ->helperText('Например: «Предпроектные работы и анализ участка»'),

                        Textarea::make('text')
                            ->label('Текст')
                            ->rows(3)
                            ->required(),

                        FileUpload::make('image')
                            ->label('Фото этого шага')
                            ->image()
                            ->directory('approach')
                            ->imageEditor()
                            ->disabled($locale !== 'ru')
                            ->dehydrated($locale === 'ru')
                            ->helperText($locale === 'ru'
                                ? 'Показывается справа, когда этот шаг открыт. Одно фото на все языки'
                                : 'Берётся из вкладки «Рус» — шаг с тем же номером. Меняется там'),

                        TextInput::make('image_caption')
                            ->label('Подпись к фото')
                            ->helperText('Например: «Curio Collection by Hilton»'),
                    ]),

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
        ];
    }
}
