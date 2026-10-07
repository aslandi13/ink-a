<x-filament-panels::page>
    @if ($tabs = $this::sectionTabs())
        @include('filament.partials.section-tabs', ['tabs' => \App\Filament\Support\SectionTabs::resolve($tabs, $this::class)])
    @endif

    {{ $this->content }}
</x-filament-panels::page>
