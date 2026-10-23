<?php

namespace App\Support;

use GdImage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class CoverThumb
{
    public const MAX_WIDTH = 900;

    public const QUALITY = 80;

    public static function path(string $cover): string
    {
        $dir = pathinfo($cover, PATHINFO_DIRNAME);
        $name = pathinfo($cover, PATHINFO_FILENAME).'-card.webp';

        return $dir && $dir !== '.' ? "{$dir}/{$name}" : $name;
    }

    public static function url(?string $cover): ?string
    {
        if (blank($cover)) {
            return null;
        }

        $thumb = self::path($cover);

        return FileUrlResolver::resolve(Storage::disk('public')->exists($thumb) ? $thumb : $cover);
    }

    public static function make(?string $cover): bool
    {
        if (blank($cover)) {
            return false;
        }

        $disk = Storage::disk('public');
        $thumb = self::path($cover);

        if ($disk->exists($thumb) || ! $disk->exists($cover)) {
            return false;
        }

        try {
            $image = @imagecreatefromstring((string) $disk->get($cover));
            if (! $image instanceof GdImage) {
                return false;
            }

            $width = imagesx($image);
            $height = imagesy($image);
            $scale = min(1.0, self::MAX_WIDTH / $width);
            $thumbWidth = max(1, (int) round($width * $scale));
            $thumbHeight = max(1, (int) round($height * $scale));
            $resized = imagecreatetruecolor($thumbWidth, $thumbHeight);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $width, $height);

            ob_start();
            imagewebp($resized, null, self::QUALITY);
            $written = $disk->put($thumb, (string) ob_get_clean(), 'public');
            imagedestroy($resized);
            imagedestroy($image);

            return (bool) $written;
        } catch (Throwable $e) {
            Log::warning('Cover thumb failed: '.$e->getMessage(), ['file' => $cover]);

            return false;
        }
    }
}
