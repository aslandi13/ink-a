<?php

namespace App\Filament\Support;

/**
 * Bridges two shapes of the same data:
 *  - "storage" shape (how spatie/laravel-translatable stores it on the model):
 *    ['title' => ['ru' => ..., 'kz' => ..., 'en' => ...], 'excerpt' => [...]]
 *  - "form" shape (how TranslatableTabs renders it, grouped by locale first):
 *    ['ru' => ['title' => ..., 'excerpt' => ...], 'kz' => [...], 'en' => [...]]
 */
class TranslatableFormData
{
    /**
     * @param  array<int, string>  $translatableKeys
     * @param  array<string, mixed>  $attributes
     * @return array<string, mixed>
     */
    public static function toFormShape(array $translatableKeys, array $attributes): array
    {
        foreach (array_keys(TranslatableTabs::LOCALES) as $locale) {
            foreach ($translatableKeys as $key) {
                $attributes[$locale][$key] = $attributes[$key][$locale] ?? null;
            }
        }

        return $attributes;
    }

    /**
     * @param  array<int, string>  $translatableKeys
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function toStorageShape(array $translatableKeys, array $data): array
    {
        foreach ($translatableKeys as $key) {
            $data[$key] = collect(array_keys(TranslatableTabs::LOCALES))
                ->mapWithKeys(fn (string $locale) => [$locale => $data[$locale][$key] ?? null])
                ->all();
        }

        foreach (array_keys(TranslatableTabs::LOCALES) as $locale) {
            unset($data[$locale]);
        }

        return $data;
    }
}
