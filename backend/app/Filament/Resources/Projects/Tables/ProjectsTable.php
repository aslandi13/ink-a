<?php

namespace App\Filament\Resources\Projects\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProjectsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('sort_order')
            ->columns([
                ImageColumn::make('cover_image')
                    ->label('Обложка')
                    ->square(),

                TextColumn::make('title')
                    ->label('Название')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('category')
                    ->label('Категория')
                    ->formatStateUsing(fn (string $state) => [
                        'architecture' => 'Архитектура',
                        'engineering' => 'Рабочее проектирование',
                        'urbanism' => 'Урбанистика и мастерпланирование',
                        'interior' => 'Дизайн интерьера',
                    ][$state] ?? $state)
                    ->badge(),

                TextColumn::make('year')
                    ->label('Год')
                    ->sortable(),

                IconColumn::make('is_published')
                    ->label('Опубликован')
                    ->boolean(),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->label('Категория')
                    ->options([
                        'architecture' => 'Архитектура',
                        'engineering' => 'Рабочее проектирование',
                        'urbanism' => 'Урбанистика и мастерпланирование',
                        'interior' => 'Дизайн интерьера',
                    ]),
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
