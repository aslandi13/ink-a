<?php

namespace App\Filament\Resources\SitePages;

use App\Filament\Pages\VisualEditor;
use App\Filament\Resources\SitePages\Pages\CreateSitePage;
use App\Filament\Resources\SitePages\Pages\EditSitePage;
use App\Filament\Resources\SitePages\Pages\ListSitePages;
use App\Filament\Support\TranslatableTabs;
use App\Models\Page;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SitePageResource extends Resource
{
    protected static ?string $model = Page::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedDocumentDuplicate;

    protected static ?string $navigationLabel = 'Страницы';

    protected static ?string $modelLabel = 'страницу';

    protected static ?string $pluralModelLabel = 'Страницы';

    public static function editorUrl(Page $page): string
    {
        return VisualEditor::urlFor($page->slug);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TranslatableTabs::make(fn (string $locale) => [
                TextInput::make('title')
                    ->label('Название')
                    ->required($locale === 'ru')
                    ->live(onBlur: true)
                    ->afterStateUpdated(function ($state, Set $set, ?Page $record) use ($locale) {
                        if ($locale === 'ru' && $record === null) {
                            $set('data.slug', Str::slug((string) $state), isAbsolute: true);
                        }
                    }),
                TextInput::make('seo_title')
                    ->label('SEO-заголовок')
                    ->helperText('Заголовок во вкладке браузера и в Google. Если пусто — берётся название.'),
                Textarea::make('seo_description')
                    ->label('SEO-описание')
                    ->rows(2),
            ]),

            Section::make('Адрес и меню')->columns(2)->schema([
                TextInput::make('slug')
                    ->label('Адрес')
                    ->prefix('/ru/')
                    ->required()
                    ->maxLength(80)
                    ->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')
                    ->validationMessages([
                        'regex' => 'Только латиница в нижнем регистре, цифры и дефис.',
                        'not_in' => 'Этот адрес уже занят разделом сайта.',
                        'unique' => 'Страница с таким адресом уже есть.',
                    ])
                    ->unique(ignoreRecord: true)
                    ->rules(fn (?Page $record) => $record?->isHome() ? [] : [Rule::notIn(Page::RESERVED_SLUGS)])
                    ->disabled(fn (?Page $record) => (bool) $record?->isHome())
                    ->dehydrated(fn (?Page $record) => ! $record?->isHome()),
                TextInput::make('menu_order')
                    ->label('Порядок в меню')
                    ->numeric()
                    ->default(0),
                Toggle::make('show_in_menu')
                    ->label('Показывать в меню сайта')
                    ->hidden(fn (?Page $record) => (bool) $record?->isHome()),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('menu_order')
            ->columns([
                TextColumn::make('title')->label('Название')->searchable(),
                TextColumn::make('slug')
                    ->label('Адрес')
                    ->formatStateUsing(fn (string $state) => $state === Page::HOME ? '/ru' : "/ru/{$state}"),
                TextColumn::make('status')
                    ->label('Статус')
                    ->state(fn (Page $record) => match (true) {
                        $record->published_at !== null => 'Опубликована',
                        $record->draft !== null => 'Черновик',
                        default => 'Пустая',
                    })
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'Опубликована' => 'success',
                        'Черновик' => 'warning',
                        default => 'gray',
                    }),
                IconColumn::make('show_in_menu')->label('В меню')->boolean(),
            ])
            ->recordActions([
                Action::make('editor')
                    ->label('Открыть в редакторе')
                    ->icon(Heroicon::OutlinedPaintBrush)
                    ->url(fn (Page $record) => static::editorUrl($record)),
                Action::make('unpublish')
                    ->label('Снять с публикации')
                    ->icon(Heroicon::OutlinedEyeSlash)
                    ->color('gray')
                    ->requiresConfirmation()
                    ->visible(fn (Page $record) => $record->published_at !== null)
                    ->action(fn (Page $record) => $record->update(['published' => null, 'published_at' => null])),
                EditAction::make(),
                DeleteAction::make()->hidden(fn (Page $record) => $record->isHome()),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSitePages::route('/'),
            'create' => CreateSitePage::route('/create'),
            'edit' => EditSitePage::route('/{record}/edit'),
        ];
    }
}
