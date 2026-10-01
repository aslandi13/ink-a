<?php

namespace App\Filament\Resources\Projects\Pages;

use App\Filament\Resources\Projects\ProjectResource;
use App\Models\Project;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListProjects extends ListRecords
{
    protected static string $resource = ProjectResource::class;

    private const CATEGORIES = [
        'architecture' => 'Архитектура',
        'engineering' => 'Рабочее проектирование',
        'urbanism' => 'Урбанистика и мастерпланирование',
        'interior' => 'Дизайн интерьера',
    ];

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        $counts = Project::query()->selectRaw('category, count(*) as total')->groupBy('category')->pluck('total', 'category');

        $tabs = ['all' => Tab::make('Все')->badge($counts->sum())];

        foreach (self::CATEGORIES as $key => $label) {
            $tabs[$key] = Tab::make($label)
                ->badge($counts[$key] ?? 0)
                ->modifyQueryUsing(fn (Builder $query) => $query->where('category', $key));
        }

        return $tabs;
    }
}
