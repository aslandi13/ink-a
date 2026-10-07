<?php

namespace App\Filament\Support;

use Filament\Resources\Resource;

class SectionTabs
{
    public static function resolve(array $tabs, string $current): array
    {
        return collect($tabs)->map(fn (string $label, string $target) => [
            'label' => $label,
            'url' => is_subclass_of($target, Resource::class) ? $target::getUrl('index') : $target::getUrl(),
            'active' => $target === $current,
        ])->values()->all();
    }

    public static function routeNames(array $tabs): array
    {
        return collect(array_keys($tabs))
            ->flatMap(fn (string $target) => is_subclass_of($target, Resource::class)
                ? [$target::getRouteBaseName().'.*']
                : [$target::getRouteName()])
            ->all();
    }
}
