<?php

namespace App\Support;

/**
 * Collapses the {ru: {...}, kz: {...}, en: {...}} locale-tab shape that
 * TranslatableTabs produces (at any nesting depth — e.g. Approach nests
 * category -> locale) down to plain values for one locale, with Russian
 * as the fallback when a translation is missing — per field, not just
 * when the whole locale slot is absent.
 */
class LocaleResolver
{
    public static function resolve(mixed $data, string $locale): mixed
    {
        if (! is_array($data)) {
            return $data;
        }

        $localeKeys = Locales::codes();
        $keys = array_keys($data);

        if (filled($keys) && blank(array_diff($keys, $localeKeys))) {
            $value = self::resolveLocaleSlot($data, $locale);

            return self::resolve($value, $locale);
        }

        $presentLocaleKeys = array_intersect($keys, $localeKeys);

        if (filled($presentLocaleKeys)) {
            $resolvedLocaleValue = self::resolve(self::resolveLocaleSlot($data, $locale), $locale);
            $resolvedLocaleValue = is_array($resolvedLocaleValue) ? $resolvedLocaleValue : [];

            $flat = array_diff_key($data, array_flip($localeKeys));
            $resolvedFlat = array_map(fn (mixed $value) => self::resolve($value, $locale), $flat);

            return array_merge($resolvedFlat, $resolvedLocaleValue);
        }

        return array_map(fn (mixed $value) => self::resolve($value, $locale), $data);
    }

    /**
     * Picks the target locale's slot, filling in any blank field (null,
     * empty string, empty array — i.e. an untranslated field) from the
     * Russian slot, recursively.
     */
    private static function resolveLocaleSlot(array $data, string $locale): mixed
    {
        $ru = $data['ru'] ?? reset($data) ?: null;
        $target = $data[$locale] ?? null;

        if ($locale === 'ru' || $target === null) {
            return $target ?? $ru;
        }

        return self::mergeWithFallback($ru, $target);
    }

    private static function mergeWithFallback(mixed $ru, mixed $target): mixed
    {
        if (is_array($ru) && is_array($target)) {
            if (array_is_list($ru) && array_is_list($target)) {
                return blank($target) ? $ru : $target;
            }

            $merged = $target;

            foreach ($ru as $key => $ruValue) {
                $merged[$key] = self::mergeWithFallback($ruValue, $target[$key] ?? null);
            }

            return $merged;
        }

        return blank($target) ? $ru : $target;
    }
}
