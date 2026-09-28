<?php

namespace App\Filament\Pages\Content;

use App\Filament\Pages\SingletonContentPage;
use App\Filament\Support\TranslatableTabs;
use BackedEnum;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use UnitEnum;

class AboutBlock extends SingletonContentPage
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedInformationCircle;

    protected static ?string $navigationLabel = 'О нас';

    protected static string|UnitEnum|null $navigationGroup = 'Главная';

    protected static ?int $navigationSort = 2;

    protected static ?string $title = 'Блок «О нас» на главной';

    public static function contentKey(): string
    {
        return 'home.about';
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->statePath('data')
            ->components([
                FileUpload::make('image')
                    ->label('Фото (шапка блока)')
                    ->image()
                    ->directory('home/about')
                    ->imageEditor(),

                TranslatableTabs::make(fn (string $locale) => [
                    Textarea::make('heading')
                        ->label('Заголовок')
                        ->rows(3)
                        ->required($locale === 'ru')
                        ->helperText('Например: «Авторская практика. Глобальный опыт. Полный цикл.»'),

                    Textarea::make('intro')
                        ->label('Вступительный абзац')
                        ->rows(4)
                        ->helperText('Показывается слева под заголовком'),

                    Textarea::make('quote')
                        ->label('Цитата основателя')
                        ->rows(3)
                        ->helperText('Например: «Архитектура и инженерия должны жить в одной мастерской. Тогда замысел доходит до площадки целым.»'),

                    Textarea::make('quote_author')
                        ->label('Автор цитаты')
                        ->rows(2)
                        ->helperText('Например: «Нурлан Камитов — основатель и креативный директор INK. RIBA Chartered Member, International Associate AIA, член-корреспондент IAA.»'),
                ]),

                Section::make('Принципы работы')
                    ->description('Картинка + список карточек «заголовок + текст» под ней')
                    ->schema([
                        FileUpload::make('principles_image')
                            ->label('Изображение')
                            ->image()
                            ->directory('home/about')
                            ->imageEditor(),

                        TranslatableTabs::make(fn (string $locale) => [
                            Repeater::make('principles')
                                ->label('Принципы')
                                ->reorderable()
                                ->addActionLabel('Добавить принцип')
                                ->schema([
                                    TextInput::make('heading')
                                        ->label('Заголовок')
                                        ->required()
                                        ->helperText('Например: «Идеи у нас проходят отбор»'),

                                    Textarea::make('text')
                                        ->label('Текст')
                                        ->rows(4)
                                        ->required(),
                                ]),
                        ]),
                    ]),
            ]);
    }
}
