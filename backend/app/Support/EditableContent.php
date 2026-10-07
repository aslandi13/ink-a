<?php

namespace App\Support;

use App\Models\PageContent;
use App\Models\TeamMember;
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
        'approach' => ['expertise_intro', 'steps.*.title', 'steps.*.text', 'steps.*.image_caption'],
        'about.history' => ['intro', 'stats.*.number', 'stats.*.label', 'highlights.*.heading', 'highlights.*.text'],
        'about.founder' => ['bio', 'position', 'achievements.*', 'credential_highlights.*.text'],
        'contacts' => ['career_label', 'career_heading', 'career_text', 'career_cta_label'],
        'legal' => ['title'],
    ];

    private const SHARED_IMAGE_FIELDS = [
        'approach' => ['steps.*.image'],
    ];

    private const LOCALE_IMAGE_FIELDS = [
        'about.founder' => ['credential_highlights.*.icon'],
    ];

    private const ROOT_TEXT_FIELDS = [
        'approach' => ['default_image_caption'],
        'about.history' => ['gallery.*.overlay_text'],
        'about.founder' => ['name'],
        'contacts' => ['email', 'facebook_handle', 'instagram_handle', 'linkedin_handle', 'address', 'phone', 'whatsapp'],
    ];

    private const NESTED_LOCALE_TEXT_FIELDS = [];

    private const GROUPED_KEYS = [
        'approach' => ['architecture', 'engineering', 'urbanism', 'interior'],
    ];

    private const IMAGE_FIELDS = [
        'home.about' => ['image', 'principles_image'],
        'home.offices' => ['map_poster'],
        'approach' => ['default_image'],
        'about.history' => ['gallery.*.image'],
        'about.founder' => ['photo'],
    ];

    /**
     * @param  array<int, array{key: string, field: string, value: ?string}>  $changes
     */
    public static function apply(string $locale, array $changes): void
    {
        [$teamChanges, $changes] = collect($changes)->partition(
            fn (array $change) => $change['key'] === 'about.team' && str_starts_with($change['field'], 'members.')
        );

        foreach ($teamChanges as $change) {
            self::applyTeamMember($locale, $change['field'], $change['value']);
        }

        $grouped = collect($changes->values()->all())->groupBy('key');

        foreach ($grouped as $key => $items) {
            $record = PageContent::firstOrCreate(['key' => $key], ['data' => []]);
            $data = $record->data ?? [];

            foreach ($items as $change) {
                $field = $change['field'];

                if (isset(self::GROUPED_KEYS[$key])) {
                    [$group, $rest] = array_pad(explode('.', $field, 2), 2, '');
                    if (! in_array($group, self::GROUPED_KEYS[$key], true)) {
                        throw new InvalidArgumentException("Поле {$key}:{$field} нельзя редактировать.");
                    }
                    $data[$group] = self::applyField($data[$group] ?? [], $key, $rest, $change['value'], $locale);
                } else {
                    $data = self::applyField($data, $key, $field, $change['value'], $locale);
                }
            }

            $record->update(['data' => $data]);
        }
    }

    private static function applyTeamMember(string $locale, string $field, ?string $value): void
    {
        if (! preg_match('/^members\.(\d+)\.(name|photo|position|credentials)$/', $field, $match)) {
            throw new InvalidArgumentException("Поле about.team:{$field} нельзя редактировать.");
        }

        $member = TeamMember::query()->where('is_published', true)->orderBy('sort_order')->skip((int) $match[1])->first();

        if ($member === null) {
            throw new InvalidArgumentException('Сотрудник не найден.');
        }

        match ($match[2]) {
            'name' => $member->name = (string) $value,
            'photo' => $member->photo = self::toStoragePath($value),
            default => $member->setTranslation($match[2], $locale, (string) $value),
        };

        $member->save();
    }

    private static function applyField(array $data, string $key, string $field, ?string $value, string $locale): array
    {
        if (self::matches(self::IMAGE_FIELDS[$key] ?? [], $field)) {
            Arr::set($data, $field, self::toStoragePath($value));
        } elseif (self::matches(self::ROOT_TEXT_FIELDS[$key] ?? [], $field)) {
            Arr::set($data, $field, (string) $value);
        } elseif (self::matches(self::NESTED_LOCALE_TEXT_FIELDS[$key] ?? [], $field)) {
            $segments = explode('.', $field);
            $last = array_pop($segments);
            Arr::set($data, implode('.', [...$segments, $locale, $last]), (string) $value);
        } elseif (self::matches(self::TEXT_FIELDS[$key] ?? [], $field)) {
            $data[$locale] = self::withListsSeeded($data[$locale] ?? [], $data['ru'] ?? [], $field);
            Arr::set($data[$locale], $field, (string) $value);
        } elseif (self::matches(self::SHARED_IMAGE_FIELDS[$key] ?? [], $field)) {
            $data['ru'] = self::withListsSeeded($data['ru'] ?? [], $data['ru'] ?? [], $field);
            Arr::set($data['ru'], $field, self::toStoragePath($value));
        } elseif (self::matches(self::LOCALE_IMAGE_FIELDS[$key] ?? [], $field)) {
            $data[$locale] = self::withListsSeeded($data[$locale] ?? [], $data['ru'] ?? [], $field);
            Arr::set($data[$locale], $field, self::toStoragePath($value));
        } else {
            throw new InvalidArgumentException("Поле {$key}:{$field} нельзя редактировать.");
        }

        return $data;
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
            $hasContent = is_array($list) && collect($list)->filter(fn ($item) => is_array($item) ? array_filter($item) : filled($item))->isNotEmpty();

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
