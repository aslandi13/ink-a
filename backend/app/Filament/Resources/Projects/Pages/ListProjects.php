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
            CreateAction::make()
                ->url(fn () => ProjectResource::getUrl('create', ['category' => $this->currentCategory()])),
        ];
    }

    public function getTabs(): array
    {
        $tabs = [];

        foreach (self::CATEGORIES as $key => $label) {
            $tabs[$key] = Tab::make($label)
                ->modifyQueryUsing(fn (Builder $query) => $query->where('category', $key));
        }

        return $tabs;
    }

    public function getDefaultActiveTab(): string | int | null
    {
        return array_key_first(self::CATEGORIES);
    }

    public function currentCategory(): string
    {
        return array_key_exists((string) $this->activeTab, self::CATEGORIES) ? (string) $this->activeTab : array_key_first(self::CATEGORIES);
    }

    public function categoryTabs(): array
    {
        $counts = Project::query()->selectRaw('category, count(*) as total')->groupBy('category')->pluck('total', 'category');

        return collect(self::CATEGORIES)
            ->map(fn (string $label, string $key) => ['label' => $label, 'count' => (int) ($counts[$key] ?? 0)])
            ->all();
    }

    public function getTabsContentComponent(): \Filament\Schemas\Components\Component
    {
        return parent::getTabsContentComponent()->hidden();
    }
}
