@php
    $categories = [
        'all' => 'Все',
        'architecture' => 'Архитектура',
        'engineering' => 'Рабочее проектирование',
        'urbanism' => 'Урбанистика и мастерпланирование',
        'interior' => 'Дизайн интерьера',
    ];

    $currentTab = $this->activeTab ?: 'all';
@endphp

<nav class="fi-tabs fi-contained flex gap-x-1 rounded-xl bg-white p-1 ring-1 ring-gray-950/5 dark:bg-white/5 dark:ring-white/10">
    @foreach ($categories as $key => $label)
        @php
            $isActive = ($currentTab === $key);
        @endphp
        <button
            type="button"
            wire:key="project-cat-tab-{{ $key }}"
            wire:click="$set('activeTab', '{{ $key }}')"
            wire:loading.attr="disabled"
            @class([
                'fi-tabs-item',
                'fi-active' => $isActive,
            ])
        >
            <span class="fi-tabs-item-label">
                {{ $label }}
            </span>
        </button>
    @endforeach
</nav>
