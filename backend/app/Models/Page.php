<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Page extends Model
{
    use HasTranslations;

    public const HOME = 'home';

    public const RESERVED_SLUGS = [
        'home', 'about', 'projects', 'approach', 'news', 'contacts', 'legal',
        'editor', 'admin', 'api', 'storage', 'livewire', 'up',
    ];

    public array $translatable = ['title', 'seo_title', 'seo_description'];

    protected $fillable = [
        'slug', 'title', 'seo_title', 'seo_description', 'show_in_menu', 'menu_order',
        'draft', 'published', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'draft' => 'array',
            'published' => 'array',
            'published_at' => 'datetime',
            'show_in_menu' => 'boolean',
        ];
    }

    public function isHome(): bool
    {
        return $this->slug === self::HOME;
    }

    public static function layoutFor(?array $layouts, string $locale): ?array
    {
        if ($layouts === null) {
            return null;
        }

        if (array_key_exists('project', $layouts) || array_key_exists('html', $layouts)) {
            return $layouts;
        }

        return $layouts[$locale] ?? $layouts['ru'] ?? null;
    }

    public static function normalizeLayouts(?array $layouts): array
    {
        if ($layouts === null) {
            return [];
        }

        if (array_key_exists('project', $layouts) || array_key_exists('html', $layouts)) {
            return ['ru' => $layouts];
        }

        return $layouts;
    }

    public function localized(string $field, string $locale): ?string
    {
        return $this->getTranslation($field, $locale, false) ?: ($this->getTranslation($field, 'ru', false) ?: null);
    }
}
