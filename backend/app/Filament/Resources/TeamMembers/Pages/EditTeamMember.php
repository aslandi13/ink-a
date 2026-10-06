<?php

namespace App\Filament\Resources\TeamMembers\Pages;

use App\Filament\Resources\TeamMembers\TeamMemberResource;
use App\Filament\Support\TranslatableFormData;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditTeamMember extends EditRecord
{
    protected static string $resource = TeamMemberResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        return TranslatableFormData::toFormShape(['position', 'credentials'], $data);
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        return TranslatableFormData::toStorageShape(['position', 'credentials'], $data);
    }
}
