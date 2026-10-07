<?php

namespace App\Filament\Resources\Projects\Pages;

use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Support\TranslatableFormData;
use App\Models\Project;
use Filament\Resources\Pages\CreateRecord;

class CreateProject extends CreateRecord
{
    protected static string $resource = ProjectResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['sort_order'] = (int) Project::where('category', $data['category'] ?? null)->max('sort_order') + 1;

        return TranslatableFormData::toStorageShape(['title', 'excerpt', 'body'], $data);
    }
}
