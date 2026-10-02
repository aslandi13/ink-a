<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Page extends Model
{
    use HasTranslations;

    public const HOME = 'home';

    public const APPROACH = 'approach';

    public const ABOUT = 'about';

    public const CONTACTS = 'contacts';

    public const NEWS = 'news';

    public const NEWS_TEMPLATE = 'news-template';

    public const LEGAL = 'legal';

    public const PROJECTS = 'projects';

    public const BUILT_IN = [self::HOME, self::APPROACH, self::ABOUT, self::CONTACTS, self::NEWS, self::LEGAL, self::PROJECTS];

    public const PROJECT_TEMPLATE = 'project-template';

    public const PROJECT_CATEGORIES = ['architecture', 'engineering', 'urbanism', 'interior'];

    public const RESERVED_SLUGS = [
        'home', 'about', 'projects', 'approach', 'news', 'contacts', 'legal',
        'editor', 'admin', 'api', 'storage', 'livewire', 'up', 'project-template',
        'project-template-architecture', 'project-template-engineering',
        'project-template-urbanism', 'project-template-interior', 'news-template',
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

    public function isBuiltInRecord(): bool
    {
        return self::isBuiltIn($this->slug);
    }

    public static function ensureBuiltIns(): void
    {
        $titles = [
            self::APPROACH => 'Подход',
            self::PROJECTS => 'Проекты',
            self::ABOUT => 'О нас',
            self::CONTACTS => 'Контакты',
            self::NEWS => 'Новости',
            self::NEWS_TEMPLATE => 'Шаблон новости',
            self::LEGAL => 'Правовая информация',
            self::PROJECT_TEMPLATE => 'Шаблон проекта: общий',
            self::PROJECT_TEMPLATE.'-architecture' => 'Шаблон проекта: Архитектура',
            self::PROJECT_TEMPLATE.'-engineering' => 'Шаблон проекта: Рабочее проектирование',
            self::PROJECT_TEMPLATE.'-urbanism' => 'Шаблон проекта: Урбанистика и мастерпланирование',
            self::PROJECT_TEMPLATE.'-interior' => 'Шаблон проекта: Дизайн интерьера',
        ];
        $order = 100;

        foreach ($titles as $slug => $title) {
            self::firstOrCreate(['slug' => $slug], ['title' => ['ru' => $title], 'menu_order' => $order++]);
        }
    }

    public static function isTemplate(string $slug): bool
    {
        return in_array($slug, self::templateSlugs(), true);
    }

    public static function templateSlugs(): array
    {
        return [
            self::PROJECT_TEMPLATE,
            ...array_map(fn ($c) => self::PROJECT_TEMPLATE.'-'.$c, self::PROJECT_CATEGORIES),
            self::NEWS_TEMPLATE,
        ];
    }

    public static function isBuiltIn(string $slug): bool
    {
        return in_array($slug, self::BUILT_IN, true) || self::isTemplate($slug);
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
