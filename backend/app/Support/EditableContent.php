<?php

namespace App\Support;

use App\Models\PageContent;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class EditableContent
{
    private const TEXT_FIELDS = [
        'home.hero' => ['title', 'subtitle', 'description', 'stats.*.number', 'stats.*.label'],
        'home.about' => ['heading', 'intro', 'quote', 'quote_author', 'principles.*.heading', 'principles.*.text'],
        'home.offices' => ['heading', 'description', 'video_label'],
        'home.key_projects' => ['heading', 'statement', 'description'],
    ];

    private const IMAGE_FIELDS = [
        'home.about' => ['image', 'principles_image'],
        'home.offices' => ['map_poster'],
    ];

    /**
     * @param  array<int, array{key: string, field: string, value: ?string}>  $changes
     */
    public static function apply(string $locale, array $changes): void
    {
        $grouped = collect($changes)->groupBy('key');

        foreach ($grouped as $key => $items) {
            $record = PageContent::firstOrCreate(['key' => $key], ['data' => []]);
            $data = $record->data ?? [];

            foreach ($items as $change) {
                $field = $change['field'];

                if (self::matches(self::IMAGE_FIELDS[$key] ?? [], $field)) {
                    $data[$field] = self::toStoragePath($change['value']);
                } elseif (self::matches(self::TEXT_FIELDS[$key] ?? [], $field)) {
                    $data[$locale] = self::withListsSeeded($data[$locale] ?? [], $data['ru'] ?? [], $field);
                    Arr::set($data[$locale], $field, (string) $change['value']);
                } else {
                    throw new InvalidArgumentException("Поле {$key}:{$field} нельзя редактировать.");
                }
            }

            $record->update(['data' => $data]);
        }
    }

    private static function matches(array $patterns, string $field): bool
    {
        foreach ($patterns as $pattern) {
            $regex = '/^'.str_replace('\*', '\d+', preg_quote($pattern, '/')).'$/';
            if (preg_match($regex, $field)) {
                return true;
            }
        }

        return false;
    }

    private static function withListsSeeded(array $target, array $ru, string $field): array
    {
        $segments = explode('.', $field);

        if (count($segments) > 1 && ctype_digit($segments[1])) {
            $list = $target[$segments[0]] ?? null;
            $hasContent = is_array($list) && collect($list)->filter(fn ($item) => is_array($item) && array_filter($item))->isNotEmpty();

            if (! $hasContent) {
                $target[$segments[0]] = $ru[$segments[0]] ?? [];
            }
        }

        return $target;
    }

    private static function toStoragePath(?string $url): ?string
    {
        if (blank($url)) {
            return null;
        }

        $base = rtrim(Storage::disk('public')->url(''), '/').'/';

        if (str_starts_with($url, $base)) {
            return substr($url, strlen($base));
        }

        $position = strpos($url, '/storage/');

        return $position === false ? $url : substr($url, $position + strlen('/storage/'));
    }
}
