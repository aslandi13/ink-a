<?php

namespace App\Filament\Resources\NewsItems\Pages;

use App\Filament\Resources\NewsItems\NewsItemResource;
use App\Filament\Support\TranslatableFormData;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditNewsItem extends EditRecord
{
    protected static string $resource = NewsItemResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
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
