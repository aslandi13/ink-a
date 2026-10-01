<x-filament-panels::page>
    <div wire:ignore style="height: calc(100vh - 7rem); margin: -1.5rem -1rem;">
        <iframe
            src="{{ $editorUrl }}"
            style="width: 100%; height: 100%; border: 0; border-radius: 0.75rem; background: #050a12;"
            allow="clipboard-write; fullscreen"
            title="Визуальный редактор"
        ></iframe>
    </div>
</x-filament-panels::page>
