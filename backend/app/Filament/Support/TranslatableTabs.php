<?php

namespace App\Filament\Support;

use App\Support\Locales;
use Filament\Schemas\Components\Component;
use Filament\Schemas\Components\Group;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;

class TranslatableTabs
{
    /**
     * Kept for backward-compatibility. Prefer Locales::SUPPORTED directly.
     *
     * @var array<string, string>
     */
    public const LOCALES = Locales::SUPPORTED;

    /**
     * Build a language-tabbed group of fields. $fields receives the locale
     * code and must return the field components for that locale (field
     * names should be relative, e.g. TextInput::make('title')) — they end
     * up nested under "{statePath}.{locale}", e.g. "title.ru".
     *
     * @param  callable(string $locale): array<Component>  $fields
     */
    public static function make(callable $fields): Tabs
    {
        return Tabs::make('Язык')
            ->tabs(
                collect(Locales::SUPPORTED)
                    ->map(fn (string $label, string $locale) => Tab::make($label)
                        ->schema([
                            Group::make($fields($locale))
                                ->statePath($locale),
                        ]))
                    ->values()
                    ->all()
            )
            ->columnSpanFull();
    }
}

