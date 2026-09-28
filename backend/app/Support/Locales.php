<?php

namespace App\Support;

/**
 * Single source of truth for supported locales.
 *
 * Referenced by:
 *  - App\Http\Middleware\SetLocaleFromRoute
 *  - App\Filament\Support\TranslatableTabs
 *  - App\Support\LocaleResolver
 */
class Locales
{
    /**
     * Supported locale codes mapped to their display labels (used in Filament tabs).
     *
     * @var array<string, string>
     */
    public const SUPPORTED = [
        'ru' => 'Рус',
        'kz' => 'Қаз',
        'en' => 'Eng',
    ];

    public const DEFAULT = 'ru';

    /**
     * @return list<string>
     */
    public static function codes(): array
    {
        return array_keys(self::SUPPORTED);
    }

    public static function isValid(string $locale): bool
    {
        return array_key_exists($locale, self::SUPPORTED);
    }
}
