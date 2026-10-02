<?php

namespace App\Filament\Pages;

use App\Models\Page as SitePage;
use BackedEnum;
use Filament\Pages\Page;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;
use Livewire\Attributes\Url;

class VisualEditor extends Page
{
    protected string $view = 'filament.pages.visual-editor';

    protected static ?string $slug = 'editor';

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPaintBrush;

    protected static ?string $navigationLabel = 'Редактор';

    protected static ?string $title = 'Редактор';

    protected Width|string|null $maxContentWidth = Width::Full;

    #[Url(as: 'page')]
    public string $pageSlug = SitePage::HOME;

    public string $editorUrl = '';

    public function mount(): void
    {
        $page = SitePage::where('slug', $this->pageSlug)->first();

        if ($page === null && ! SitePage::isBuiltIn($this->pageSlug)) {
            $this->pageSlug = SitePage::HOME;
        }

        $user = auth()->user();
        $user->tokens()->where('name', 'page-editor-embed')->delete();
        $token = $user->createToken('page-editor-embed', ['page-editor'], now()->addHours(12))->plainTextToken;

        $frontend = rtrim((string) (config('cors.allowed_origins')[0] ?? 'http://localhost:5173'), '/');
        $this->editorUrl = "{$frontend}/editor/{$this->pageSlug}?embed=1#token=".urlencode($token);
    }

    public function getHeading(): string
    {
        return '';
    }

    public static function urlFor(string $slug): string
    {
        return static::getUrl(['page' => $slug]);
    }
}
