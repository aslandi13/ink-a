<?php

namespace App\Filament\Resources\Projects\Pages;

use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Support\TranslatableFormData;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProject extends EditRecord
{
    protected static string $resource = ProjectResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make()->successRedirectUrl(fn () => $this->listUrl()),
        ];
    }

    public function getTitle(): string
    {
        return $this->getRecord()->getTranslation('title', 'ru', false) ?: 'Проект';
    }

    public function getBreadcrumbs(): array
    {
        $category = $this->getRecord()->category;

        return [
            $this->listUrl() => 'Проекты',
            $this->listUrl().'#' => ListProjects::CATEGORIES[$category] ?? $category,
            $this->getTitle(),
        ];
    }

    private function listUrl(): string
    {
        return ProjectResource::getUrl('index', ['tab' => $this->getRecord()->category]);
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        return TranslatableFormData::toFormShape(['title', 'excerpt', 'body'], $data);
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        return TranslatableFormData::toStorageShape(['title', 'excerpt', 'body'], $data);
    }
}
