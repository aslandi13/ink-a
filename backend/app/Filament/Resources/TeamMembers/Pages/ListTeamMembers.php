<?php

namespace App\Filament\Resources\TeamMembers\Pages;

use App\Filament\Pages\Content\AboutTeam;
use App\Filament\Resources\TeamMembers\TeamMemberResource;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTeamMembers extends ListRecords
{
    protected static string $resource = TeamMemberResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('seo')
                ->label('SEO раздела')
                ->color('gray')
                ->url(AboutTeam::getUrl()),
            CreateAction::make(),
        ];
    }
}
