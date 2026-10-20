<?php

namespace App\Filament\Resources\Projects\Pages;

use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Support\TranslatableFormData;
use App\Models\Project;
use Filament\Resources\Pages\CreateRecord;

class CreateProject extends CreateRecord
{
    protected static string $resource = ProjectResource::class;

    public function getBreadcrumbs(): array
    {
        $category = request()->query('category') ?? ($this->data['category'] ?? null);
        $category = array_key_exists((string) $category, ListProjects::CATEGORIES) ? $category : array_key_first(ListProjects::CATEGORIES);

        return [
            ProjectResource::getUrl('index', ['tab' => $category]) => 'Проекты',
            ProjectResource::getUrl('index', ['tab' => $category]).'#' => ListProjects::CATEGORIES[$category],
            'Новый проект',
        ];
    }

    protected function getRedirectUrl(): string
    {
        return ProjectResource::getUrl('index', ['tab' => $this->getRecord()->category]);
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['sort_order'] = (int) Project::where('category', $data['category'] ?? null)->max('sort_order') + 1;

        return TranslatableFormData::toStorageShape(['title', 'excerpt', 'body'], $data);
    }
}
