<x-filament-panels::page>
    @if ($tabs = $this::sectionTabs())
        <nav class="fi-tabs fi-contained flex flex-wrap gap-x-1 rounded-xl bg-white p-1 ring-1 ring-gray-950/5 dark:bg-white/5 dark:ring-white/10">
            @foreach ($tabs as $page => $label)
                <a
                    href="{{ $page::getUrl() }}"
                    @class(['fi-tabs-item', 'fi-active' => $page === $this::class])
                >
                    <span class="fi-tabs-item-label">{{ $label }}</span>
                </a>
            @endforeach
        </nav>
    @endif

    {{ $this->content }}
</x-filament-panels::page>
