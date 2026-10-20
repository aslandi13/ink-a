<?php

namespace App\Filament\RichEditor;

use Tiptap\Core\Mark;

class FontFamilyExtension extends Mark
{
    public static $name = 'fontFamily';

    public function parseHTML(): array
    {
        return [
            [
                'tag' => 'span',
                'getAttrs' => fn ($DOMNode): bool => $DOMNode->hasAttribute('data-font'),
            ],
        ];
    }

    public function addAttributes(): array
    {
        return [
            'font' => [
                'parseHTML' => fn ($DOMNode) => in_array($DOMNode->getAttribute('data-font'), ['serif', 'sans'], true) ? $DOMNode->getAttribute('data-font') : null,
                'renderHTML' => fn ($attributes) => ['data-font' => is_object($attributes) ? ($attributes->font ?? null) : ($attributes['font'] ?? null)],
            ],
        ];
    }

    public function renderHTML($mark, $HTMLAttributes = []): array
    {
        return ['span', $HTMLAttributes, 0];
    }
}
