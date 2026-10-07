<nav class="fi-tabs fi-contained flex flex-wrap gap-x-1 rounded-xl bg-white p-1 ring-1 ring-gray-950/5 dark:bg-white/5 dark:ring-white/10">
    @foreach ($tabs as $tab)
        <a href="{{ $tab['url'] }}" @class(['fi-tabs-item', 'fi-active' => $tab['active']])>
            <span class="fi-tabs-item-label">{{ $tab['label'] }}</span>
        </a>
    @endforeach
</nav>
