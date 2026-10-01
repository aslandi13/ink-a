<?php

namespace App\Filament\Resources\SitePages\Pages;

use App\Filament\Resources\SitePages\SitePageResource;
use App\Filament\Support\TranslatableFormData;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Icons\Heroicon;

class EditSitePage extends EditRecord
{
    protected static string $resource = SitePageResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('editor')
                ->label('Открыть в редакторе')
                ->icon(Heroicon::OutlinedPaintBrush)
                ->url(fn () => SitePageResource::editorUrl($this->getRecord())),
            DeleteAction::make()->hidden(fn () => $this->getRecord()->isHome()),
        ];
    }

    protected function mutateFormDataBeforeFill(array $data): array
    {
        return TranslatableFormData::toFormShape(['title', 'seo_title', 'seo_description'], $data);
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        return TranslatableFormData::toStorageShape(['title', 'seo_title', 'seo_description'], $data);
    }
}
