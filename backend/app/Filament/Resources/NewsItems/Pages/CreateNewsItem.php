<?php

namespace App\Filament\Resources\NewsItems\Pages;

use App\Filament\Resources\NewsItems\NewsItemResource;
use App\Filament\Support\TranslatableFormData;
use Filament\Resources\Pages\CreateRecord;

class CreateNewsItem extends CreateRecord
{
    protected static string $resource = NewsItemResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        return TranslatableFormData::toStorageShape(['title', 'excerpt', 'body'], $data);
    }
}
