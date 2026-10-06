<?php

namespace App\Providers;

use App\Support\ImageOptimizer;
use Filament\Forms\Components\BaseFileUpload;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Illuminate\Support\Str;
use Illuminate\Support\ServiceProvider;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Allow up to 50MB uploads (e.g. high-res camera photos or videos).
        // Raster images (JPEG, PNG, WebP) are automatically downscaled to max 3000px
        // and converted to modern WebP format on the server to keep site fast.
        // Videos, SVGs and other non-raster files are stored as-is without modification.
        Repeater::configureUsing(fn (Repeater $repeater) => $repeater
            ->collapsible()
            ->collapsed()
            ->itemLabel(function (array $state): ?string {
                foreach (['title', 'heading', 'name', 'number', 'label', 'text', 'overlay_text'] as $key) {
                    if (is_string($state[$key] ?? null) && trim($state[$key]) !== '') {
                        return Str::limit(trim(strip_tags($state[$key])), 80);
                    }
                }

                foreach ($state as $value) {
                    if (is_string($value) && trim($value) !== '' && ! str_contains($value, '/')) {
                        return Str::limit(trim(strip_tags($value)), 80);
                    }
                }

                return null;
            }));

        FileUpload::configureUsing(function (FileUpload $fileUpload): void {
            $fileUpload
                ->imageEditor(fn (FileUpload $component): bool => in_array('image/*', $component->getAcceptedFileTypes() ?? [], true))
                ->maxSize(51200)
                ->hint('до 50 МБ · авто-сжатие WebP')
                ->saveUploadedFileUsing(function (BaseFileUpload $component, TemporaryUploadedFile $file): ?string {
                    $path = $component->saveUploadedFile($file);

                    if (! $path) {
                        return null;
                    }

                    return ImageOptimizer::optimizeStoredFile($component->getDisk(), $path);
                });
        });
    }
}
