<?php

namespace App\Filament\Resources\Projects\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
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
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                Action::make('categories')
                    ->view('filament.projects.tabs'),
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
