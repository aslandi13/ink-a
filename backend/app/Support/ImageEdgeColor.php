<?php

namespace App\Support;

use GdImage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Throwable;

class ImageEdgeColor
{
    public static function for(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        return Cache::rememberForever('edge-color:'.$path, fn () => self::detect($path));
    }

    private static function detect(string $path): ?string
    {
        try {
            $disk = Storage::disk('public');
            if (! $disk->exists($path)) {
                return null;
            }

            $image = @imagecreatefromstring((string) $disk->get($path));
            if (! $image instanceof GdImage) {
                return null;
            }

            $width = imagesx($image);
            $height = imagesy($image);
            $sum = [0, 0, 0];
            $count = 0;

            foreach ([1, $width - 2] as $x) {
                for ($y = 0; $y < $height; $y += max(1, intdiv($height, 40))) {
                    $rgb = imagecolorat($image, max(0, $x), $y);
                    $sum[0] += ($rgb >> 16) & 0xFF;
                    $sum[1] += ($rgb >> 8) & 0xFF;
                    $sum[2] += $rgb & 0xFF;
                    $count++;
                }
            }

            imagedestroy($image);

            return $count ? sprintf('#%02x%02x%02x', ...array_map(fn (int $v) => intdiv($v, $count), $sum)) : null;
        } catch (Throwable) {
            return null;
        }
    }
}
