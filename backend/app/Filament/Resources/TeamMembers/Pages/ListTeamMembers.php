<?php

namespace App\Filament\Resources\TeamMembers\Pages;

use App\Filament\Pages\Content\AboutHistory;
use App\Filament\Pages\Content\AboutTeam;
use App\Filament\Support\SectionTabs;
use App\Filament\Resources\TeamMembers\TeamMemberResource;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Contracts\Support\Htmlable;
use Illuminate\Support\HtmlString;

class ListTeamMembers extends ListRecords
{
    protected static string $resource = TeamMemberResource::class;

    public function getHeading(): string
    {
        return 'О нас';
    }

    public function getSubheading(): Htmlable
    {
        $tabs = AboutHistory::sectionTabs();

        return new HtmlString(view('filament.partials.section-tabs', [
            'tabs' => SectionTabs::resolve($tabs, TeamMemberResource::class),
        ])->render());
    }

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
