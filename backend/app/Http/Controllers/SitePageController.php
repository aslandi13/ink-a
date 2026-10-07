<?php

namespace App\Http\Controllers;

use App\Models\NewsItem;
use App\Models\Page;
use App\Models\PageContent;
use App\Models\Project;
use App\Support\FileUrlResolver;
use App\Support\LocaleResolver;
use App\Support\Locales;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class SitePageController extends Controller
{
    private const BRAND = 'INK Architects';

    private const TITLES = [
        'projects' => ['ru' => 'Проекты', 'kz' => 'Жобалар', 'en' => 'Projects'],
        'news' => ['ru' => 'Новости', 'kz' => 'Жаңалықтар', 'en' => 'News'],
        'about' => ['ru' => 'О нас', 'kz' => 'Біз туралы', 'en' => 'About'],
        'approach' => ['ru' => 'Подход', 'kz' => 'Тәсіл', 'en' => 'Approach'],
        'contacts' => ['ru' => 'Контакты', 'kz' => 'Байланыс', 'en' => 'Contacts'],
        'legal' => ['ru' => 'Правовая информация и условия использования', 'kz' => 'Құқықтық ақпарат', 'en' => 'Legal information and terms of use'],
    ];

    public function __invoke(?string $path = null): Response
    {
        $index = config('site.index_path');
        $html = is_string($index) && is_file($index) ? file_get_contents($index) : null;

        if ($html === null || $html === false) {
            abort(404);
        }

        $segments = array_values(array_filter(explode('/', trim((string) $path, '/')), 'strlen'));
        $locale = in_array($segments[0] ?? '', Locales::codes(), true) ? array_shift($segments) : 'ru';

        $meta = $this->metaFor($segments, $locale);

        return response($this->inject($html, $meta, $locale, (string) $path))
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'no-cache');
    }

    private function metaFor(array $segments, string $locale): array
    {
        $settings = $this->content('site_settings', $locale);
        $default = [
            'title' => $settings['seo_title'] ?? self::BRAND,
            'description' => $settings['seo_description'] ?? null,
            'image' => $settings['og_image'] ?? null,
        ];

        $meta = match (true) {
            $segments === [] => $this->home($locale),
            $segments[0] === 'projects' && count($segments) >= 2 => $this->project($segments, $locale),
            $segments[0] === 'news' && count($segments) === 2 => $this->news($segments[1], $locale),
            $segments[0] === 'about' => $this->section('about.history', 'about', $locale),
            $segments[0] === 'approach' => $this->approach($locale, $segments[1] ?? null),
            $segments[0] === 'contacts' => $this->section('contacts', 'contacts', $locale),
            $segments[0] === 'legal' => [
                'title' => filled($this->content('legal', $locale)['title'] ?? null)
                    ? $this->content('legal', $locale)['title'].' — '.self::BRAND
                    : $this->pageTitle('legal', $locale),
                'description' => $this->content('legal', $locale)['body'] ?? null,
            ],
            isset(self::TITLES[$segments[0]]) => ['title' => $this->pageTitle($segments[0], $locale)],
            default => $this->customPage($segments[0], $locale),
        };

        return [
            'title' => filled($meta['title'] ?? null) ? $meta['title'] : $default['title'],
            'description' => $this->text($meta['description'] ?? null) ?: $this->text($default['description']),
            'image' => ($meta['image'] ?? null) ?: $default['image'],
        ];
    }

    private function home(string $locale): array
    {
        $hero = $this->content('home.hero', $locale);

        return [
            'title' => $hero['seo_title'] ?? null,
            'description' => ($hero['seo_description'] ?? null) ?: ($hero['description'] ?? null),
            'image' => $hero['og_image'] ?? null,
        ];
    }

    private function project(array $segments, string $locale): array
    {
        $query = Project::query()->where('is_published', true);

        if (count($segments) >= 3) {
            $query->where('category', ['urban-planning' => 'urbanism', 'public-interior' => 'interior'][$segments[1]] ?? $segments[1])->where('slug', $segments[2]);
        } else {
            $query->where('slug', $segments[1])->orderBy('sort_order');
        }

        $project = $query->first();

        if ($project === null) {
            return ['title' => $this->pageTitle('projects', $locale)];
        }

        return [
            'title' => $this->translated($project, 'title', $locale).' — '.self::BRAND,
            'description' => $this->translated($project, 'excerpt', $locale) ?: $this->translated($project, 'body', $locale),
            'image' => FileUrlResolver::resolve($project->cover_image),
        ];
    }

    private function news(string $slug, string $locale): array
    {
        $item = NewsItem::query()->where('slug', $slug)->where('is_published', true)->first();

        if ($item === null) {
            return ['title' => $this->pageTitle('news', $locale)];
        }

        return [
            'title' => $this->translated($item, 'title', $locale).' — '.self::BRAND,
            'description' => $this->translated($item, 'excerpt', $locale) ?: $this->translated($item, 'body', $locale),
            'image' => FileUrlResolver::resolve($item->cover_image),
        ];
    }

    private function section(string $key, string $page, string $locale): array
    {
        $data = $this->content($key, $locale);

        return [
            'title' => ($data['seo_title'] ?? null) ?: $this->pageTitle($page, $locale),
            'description' => $data['seo_description'] ?? null,
            'image' => $data['og_image'] ?? null,
        ];
    }

    private function approach(string $locale, ?string $slug): array
    {
        $category = ['engineering' => 'engineering', 'urban-planning' => 'urbanism', 'public-interior' => 'interior'][$slug] ?? 'architecture';
        $data = $this->content('approach', $locale)[$category] ?? [];

        return [
            'title' => ($data['seo_title'] ?? null) ?: $this->pageTitle('approach', $locale),
            'description' => ($data['seo_description'] ?? null) ?: ($data['expertise_intro'] ?? null),
            'image' => ($data['og_image'] ?? null) ?: ($data['default_image'] ?? null),
        ];
    }

    private function customPage(string $slug, string $locale): array
    {
        $page = Page::where('slug', $slug)->whereNotNull('published_at')->first();

        if ($page === null || Page::isBuiltIn($slug)) {
            return [];
        }

        $title = $page->localized('seo_title', $locale) ?: $page->localized('title', $locale);

        return [
            'title' => $title ? $title.' — '.self::BRAND : null,
            'description' => $page->localized('seo_description', $locale),
        ];
    }

    private function pageTitle(string $page, string $locale): string
    {
        $titles = self::TITLES[$page];

        return ($titles[$locale] ?? $titles['ru']).' — '.self::BRAND;
    }

    private function content(string $key, string $locale): array
    {
        $record = PageContent::where('key', $key)->first();
        $data = FileUrlResolver::resolve(LocaleResolver::resolve($record?->data ?? [], $locale));

        return is_array($data) ? $data : [];
    }

    private function translated(object $model, string $field, string $locale): ?string
    {
        return $model->getTranslation($field, $locale, false) ?: ($model->getTranslation($field, 'ru', false) ?: null);
    }

    private function text(?string $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        $text = trim(preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags(str_replace('<', ' <', $value)), ENT_QUOTES | ENT_HTML5)));

        return $text === '' ? null : Str::limit($text, 157, '…');
    }

    private function inject(string $html, array $meta, string $locale, string $path): string
    {
        $e = fn (?string $value) => htmlspecialchars((string) $value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $url = rtrim((string) config('site.url'), '/').'/'.ltrim($path, '/');

        $tags = [
            '<meta property="og:type" content="website" data-rh="true" />',
            '<meta property="og:site_name" content="'.self::BRAND.'" data-rh="true" />',
            '<meta property="og:title" content="'.$e($meta['title']).'" data-rh="true" />',
            '<meta property="og:url" content="'.$e($url).'" data-rh="true" />',
            '<meta name="twitter:card" content="summary_large_image" data-rh="true" />',
        ];

        if ($meta['description']) {
            $tags[] = '<meta name="description" content="'.$e($meta['description']).'" data-rh="true" />';
            $tags[] = '<meta property="og:description" content="'.$e($meta['description']).'" data-rh="true" />';
        }

        if ($meta['image']) {
            $tags[] = '<meta property="og:image" content="'.$e($meta['image']).'" data-rh="true" />';
        }

        $html = preg_replace('#<title>.*?</title>#s', '<title>'.$e($meta['title']).'</title>', $html, 1);
        $html = preg_replace('#<html lang="[^"]*"#', '<html lang="'.($locale === 'kz' ? 'kk' : $locale).'"', $html, 1);

        return str_replace('</head>', '    '.implode("\n    ", $tags)."\n  </head>", $html);
    }
}
