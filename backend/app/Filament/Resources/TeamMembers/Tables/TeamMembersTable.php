<?php

namespace App\Filament\Resources\TeamMembers\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TeamMembersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('sort_order')
            ->reorderable('sort_order')
            ->reorderRecordsTriggerAction(fn (Action $action, bool $isReordering) => $action
                ->button()
                ->label($isReordering ? 'Готово' : 'Изменить порядок')
                ->icon($isReordering ? 'heroicon-o-check' : 'heroicon-o-arrows-up-down'))
            ->columns([
                ImageColumn::make('photo')
                    ->label('Фото')
                    ->disk('public')
                    ->square(),

                TextColumn::make('name')
                    ->label('ФИО')
                    ->searchable(),

                TextColumn::make('position')
                    ->label('Должность')
                    ->limit(50),

                IconColumn::make('is_published')
                    ->label('Опубликован')
                    ->boolean(),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
