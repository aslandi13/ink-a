<?php

namespace App\Filament\Pages;

use App\Models\PageContent;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Actions;
use Filament\Schemas\Components\EmbeddedSchema;
use Filament\Schemas\Components\Form;
use Filament\Schemas\Schema;

/**
 * Base page for editing a single JSON-backed content block (page_contents
 * table), instead of a full CRUD resource. Each subclass just needs
 * contentKey() + form().
 */
abstract class SingletonContentPage extends Page
{
    protected string $view = 'filament.pages.singleton-content-page';

    /**
     * @var array<string, mixed>
     */
    public ?array $data = [];

    abstract public static function contentKey(): string;

    public static function sectionTabs(): array
    {
        return [];
    }

    public static function sectionGroupTitle(): ?string
    {
        return null;
    }

    public function getHeading(): string
    {
        return static::sectionGroupTitle() ?? parent::getHeading();
    }

    public function mount(): void
    {
        $record = PageContent::firstOrCreate(
            ['key' => static::contentKey()],
            ['data' => []],
        );

        $this->form->fill(static::prepareData($record->data ?? []));
    }

    public static function prepareData(array $data): array
    {
        return $data;
    }

    public function content(Schema $schema): Schema
    {
        return $schema
            ->components([
                Form::make([EmbeddedSchema::make('form')])
                    ->id('form')
                    ->livewireSubmitHandler('save')
                    ->footer([
                        Actions::make([
                            Action::make('save')
                                ->label('Сохранить')
                                ->submit('save')
                                ->keyBindings(['mod+s']),
                        ]),
                    ]),
            ]);
    }

    public function save(): void
    {
        $data = static::prepareData($this->form->getState());

        PageContent::updateOrCreate(
            ['key' => static::contentKey()],
            ['data' => $data],
        );

        Notification::make()
            ->title('Сохранено')
            ->success()
            ->send();
    }
}
