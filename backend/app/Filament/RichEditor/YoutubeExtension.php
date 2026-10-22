<?php

namespace App\Filament\RichEditor;

use Tiptap\Core\Node;

class YoutubeExtension extends Node
{
    public static $name = 'youtube';

    public function addOptions(): array
    {
        return ['HTMLAttributes' => []];
    }

    public function parseHTML(): array
    {
        return [
            [
                'tag' => 'iframe',
                'getAttrs' => fn ($DOMNode): bool => (bool) self::embedUrl((string) $DOMNode->getAttribute('src')),
            ],
        ];
    }

    public function addAttributes(): array
    {
        return [
            'src' => [
                'parseHTML' => fn ($DOMNode) => self::embedUrl((string) $DOMNode->getAttribute('src')),
            ],
        ];
    }

    public function renderHTML($node, $HTMLAttributes = []): array
    {
        return [
            'div',
            ['data-youtube-video' => 'true'],
            [
                'iframe',
                [
                    'src' => self::embedUrl((string) ($HTMLAttributes['src'] ?? '')),
                    'width' => '640',
                    'height' => '360',
                    'allowfullscreen' => 'true',
                    'allow' => 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                    'loading' => 'lazy',
                ],
            ],
        ];
    }

    public static function embedUrl(string $url): ?string
    {
        if (preg_match('~^(?:https?:)?//(?:www\.|m\.)?(?:youtube\.com/(?:watch\?(?:.*&)?v=|embed/|shorts/|live/)|youtube-nocookie\.com/embed/|youtu\.be/)([\w-]{11})~', trim($url), $match)) {
            return 'https://www.youtube-nocookie.com/embed/'.$match[1];
        }

        return null;
    }
}
