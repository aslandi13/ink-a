<?php

namespace App\Providers\Filament;

use App\Filament\Pages\Content\AboutBlock;
use App\Filament\Pages\Content\AboutFounder;
use App\Filament\Pages\Content\AboutHistory;
use App\Filament\Pages\Content\AboutTeam;
use App\Filament\Pages\Content\Approach;
use App\Filament\Pages\Content\Contacts;
use App\Filament\Pages\Content\Hero;
use App\Filament\Pages\Content\KeyProjects;
use App\Filament\Pages\Content\Legal;
use App\Filament\Pages\Content\Offices;
use App\Filament\Pages\Content\SiteSettings;
use App\Filament\Pages\Content\VideoBanner;
use App\Filament\Pages\VisualEditor;
use App\Filament\Resources\NewsItems\NewsItemResource;
use App\Filament\Resources\Projects\ProjectResource;
use App\Filament\Resources\TeamMembers\TeamMemberResource;
use App\Filament\Resources\SitePages\SitePageResource;
use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationBuilder;
use Filament\Navigation\NavigationGroup;
use Filament\Support\Icons\Heroicon;
use Filament\Navigation\NavigationItem;
use App\Filament\Support\SectionTabs;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\View\PanelsRenderHook;
use Filament\Support\Colors\Color;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->renderHook(PanelsRenderHook::HEAD_END, fn (): string => '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Playfair+Display:wght@400;500&display=swap"><style>.fi-fo-rich-editor [data-font=serif]{font-family:"Playfair Display",Georgia,serif}.ink-gallery .filepond--item{width:calc(50% - .5rem)!important}@media (min-width:768px){.ink-gallery .filepond--item{width:calc(25% - .5rem)!important}}@media (min-width:1280px){.ink-gallery .filepond--item{width:calc(16.666% - .5rem)!important}}.fi-fo-rich-editor-toolbar{position:sticky;top:var(--topbar-height,4rem);z-index:20;background:var(--gray-900);border-top-left-radius:inherit;border-top-right-radius:inherit}html:not(.dark) .fi-fo-rich-editor-toolbar{background:#fff}</style>')
            ->path('admin')
            ->login()
            ->colors([
                'primary' => Color::Amber,
            ])
            ->brandName('INK Admin')
            ->brandLogo(fn () => view('filament.logo'))
            ->brandLogoHeight('2.25rem')
            ->favicon(asset('favicon.png'))
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->navigation(function (NavigationBuilder $builder): NavigationBuilder {
                return $builder
                    ->items([
                        ...Dashboard::getNavigationItems(),
                        ...SitePageResource::getNavigationItems(),
                        ...VisualEditor::getNavigationItems(),
                        NavigationItem::make('Главная')
                            ->icon(Heroicon::OutlinedSquares2x2)
                            ->url(fn () => Hero::getUrl())
                            ->isActiveWhen(fn () => request()->routeIs(SectionTabs::routeNames(Hero::sectionTabs()))),
                        ...ProjectResource::getNavigationItems(),
                        ...Approach::getNavigationItems(),
                        NavigationItem::make('О нас')
                            ->icon(Heroicon::OutlinedInformationCircle)
                            ->url(fn () => AboutHistory::getUrl())
                            ->isActiveWhen(fn () => request()->routeIs(SectionTabs::routeNames(AboutHistory::sectionTabs()))),
                        ...NewsItemResource::getNavigationItems(),
                        ...Contacts::getNavigationItems(),
                        ...SiteSettings::getNavigationItems(),
                        ...Legal::getNavigationItems(),
                    ]);
            })
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                AccountWidget::class,
                FilamentInfoWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
