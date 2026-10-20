<?php

namespace App\Filament\Resources\Projects\Pages;

use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Support\TranslatableTabs;
use App\Models\PageContent;
use App\Support\Locales;
use App\Models\Project;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Toggle;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Builder;

class ListProjects extends ListRecords
{
    protected static string $resource = ProjectResource::class;

    public const CATEGORIES = [
        'architecture' => 'Архитектура',
        'engineering' => 'Рабочее проектирование',
        'urbanism' => 'Урбанистика и мастерпланирование',
        'interior' => 'Дизайн интерьера',
    ];

    protected function getHeaderActions(): array
    {
        return [
            Action::make('intro')
                ->label('Карточка раздела')
                ->color('gray')
                ->modalHeading(fn () => 'Карточка раздела: '.self::CATEGORIES[$this->currentCategory()])
                ->modalDescription('Большая картинка в начале списка проектов. При нажатии ведёт в «Подход» этого раздела. Если выключена — большим будет первый проект.')
                ->fillForm(fn () => $this->introFormData($this->introData()[$this->currentCategory()] ?? []))
                ->schema([
                    TranslatableTabs::make(fn (string $locale) => [
                        FileUpload::make('image')
                            ->label('Картинка')
                            ->image()
                            ->disk('public')
                            ->directory('projects/intro')
                            ->helperText($locale === 'ru' ? 'Обязательна для показа карточки' : 'Если пусто — покажется русская картинка'),
                    ]),
                    Toggle::make('enabled')
                        ->label('Показывать'),
                ])
                ->action(function (array $data) {
                    $intro = $this->introData();
                    $intro[$this->currentCategory()] = [
                        'enabled' => (bool) ($data['enabled'] ?? false),
                        ...collect(array_keys(Locales::SUPPORTED))
                            ->mapWithKeys(fn (string $locale) => [$locale => ['image' => $data[$locale]['image'] ?? null]])
                            ->all(),
                    ];
                    PageContent::updateOrCreate(['key' => 'projects_intro'], ['data' => $intro]);
                    Notification::make()->title('Сохранено')->success()->send();
                }),
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

    private function introFormData(array $card): array
    {
        if (filled($card['image'] ?? null) && blank($card['ru']['image'] ?? null)) {
            $card['ru']['image'] = $card['image'];
        }
        unset($card['image']);

        return $card + ['enabled' => false];
    }

    private function introData(): array
    {
        $data = PageContent::where('key', 'projects_intro')->first()?->data;

        return is_array($data) ? $data : [];
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
