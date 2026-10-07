<?php

namespace App\Support;

class SharedImages
{
    public static function apply(string $key, array $data): array
    {
        return match ($key) {
            'approach' => self::approach($data),
            'about.founder' => self::fromRussian($data, 'credential_highlights', 'icon'),
            default => $data,
        };
    }

    public static function fromRussian(array $localized, string $list, string $field): array
    {
        $ruItems = array_values($localized['ru'][$list] ?? []);

        foreach (array_keys(Locales::SUPPORTED) as $locale) {
            if ($locale === 'ru' || ! is_array($localized[$locale][$list] ?? null)) {
                continue;
            }

            $index = 0;
            foreach ($localized[$locale][$list] as $itemKey => $item) {
                if (is_array($item)) {
                    $localized[$locale][$list][$itemKey][$field] = $ruItems[$index][$field] ?? null;
                }
                $index++;
            }
        }

        return $localized;
    }

    private static function approach(array $data): array
    {
        foreach ($data as $category => $content) {
            if (is_array($content) && isset($content['ru'])) {
                $data[$category] = self::fromRussian($content, 'steps', 'image');
            }
        }

        return $data;
    }
}
