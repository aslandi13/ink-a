<?php

namespace App\Filament\Resources\TeamMembers\Schemas;

use App\Filament\Support\TranslatableTabs;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class TeamMemberForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(1)
            ->components([
                FileUpload::make('photo')
                    ->label('Фото')
                    ->image()
                    ->directory('about/team'),

                TranslatableTabs::make(fn (string $locale) => [
                    TextInput::make('name')
                        ->label('ФИО')
                        ->required($locale === 'ru')
                        ->helperText($locale === 'en' ? 'Латиницей, например: Nurlan Kamitov. Если пусто — покажется русское' : 'Если пусто — покажется русское'),

                    TextInput::make('position')
                        ->label('Должность')
                        ->required($locale === 'ru')
                        ->helperText('Например: «Основатель, креативный директор»'),

                    TextInput::make('credentials')
                        ->label('Регалии')
                        ->helperText('Необязательно. Например: «RIBA, AIA, IAA»'),
                ]),

                Toggle::make('is_published')
                    ->label('Опубликован')
                    ->default(true),
            ]);
    }
}
