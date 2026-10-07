<?php

namespace App\Filament\Resources\NewsItems\Pages;

use Filament\Actions\Action;

trait HasPublishToggle
{
    protected function getFormActions(): array
    {
        return [
            ...parent::getFormActions(),
            Action::make('togglePublished')
                ->label(fn () => ($this->data['is_published'] ?? true) ? 'Опубликована' : 'Не опубликована')
                ->icon(fn () => ($this->data['is_published'] ?? true) ? 'heroicon-o-eye' : 'heroicon-o-eye-slash')
                ->color(fn () => ($this->data['is_published'] ?? true) ? 'success' : 'gray')
                ->outlined()
                ->tooltip('Нажмите, чтобы переключить, затем «Сохранить»')
                ->action(fn () => $this->data['is_published'] = ! ($this->data['is_published'] ?? true)),
        ];
    }
}
