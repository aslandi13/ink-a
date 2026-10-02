<?php

namespace App\Filament\Resources\SitePages\Pages;

use App\Filament\Resources\SitePages\SitePageResource;
use App\Models\Page;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListSitePages extends ListRecords
{
    protected static string $resource = SitePageResource::class;

    public function mount(): void
    {
        Page::ensureBuiltIns();
        parent::mount();
    }

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
