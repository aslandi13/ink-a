<?php

namespace App\Support;

use App\Models\PageContent;
use GdImage;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class GalleryWatermark
{
    public const THUMB_MAX = 1200;

    public const THUMB_QUALITY = 85;

    public const FULL_QUALITY = 90;

    private const SIZES = ['small' => 0.075, 'medium' => 0.1014, 'large' => 0.135];

    private const RIGHT = 0.025;

    private const BOTTOM = 0.0375;

    public static function thumbPath(string $path): string
    {
        $dir = pathinfo($path, PATHINFO_DIRNAME);
        $name = pathinfo($path, PATHINFO_FILENAME).'-thumb.webp';

        return $dir && $dir !== '.' ? "{$dir}/{$name}" : $name;
    }

    public static function isProcessed(string $path): bool
    {
        return Storage::disk('public')->exists(self::thumbPath($path));
    }

    public static function markerPath(string $path): string
    {
        return $path.'.stamped';
    }

    public static function isStamped(string $path): bool
    {
        return Storage::disk('public')->exists(self::markerPath($path));
    }

    public static function process(string $path): string
    {
        $disk = Storage::disk('public');

        if (self::isProcessed($path) || ! $disk->exists($path)) {
            return $path;
        }

        try {
            $image = self::load($path);

            if ($image === null) {
                return $path;
            }

            self::saveThumb($disk, $image, $path);

            return self::stampAndSave($image, $path);
        } catch (Throwable $e) {
            Log::warning('Gallery watermark failed: '.$e->getMessage(), ['file' => $path]);

            return $path;
        }
    }

    public static function stampExisting(string $path): string
    {
        if (! self::isProcessed($path)) {
            return self::process($path);
        }

        if (self::isStamped($path)) {
            return $path;
        }

        try {
            $image = self::load($path);

            return $image === null ? $path : self::stampAndSave($image, $path);
        } catch (Throwable $e) {
            Log::warning('Gallery watermark failed: '.$e->getMessage(), ['file' => $path]);

            return $path;
        }
    }

    private static function load(string $path): ?GdImage
    {
        $image = @imagecreatefromstring((string) Storage::disk('public')->get($path));

        if (! $image instanceof GdImage) {
            return null;
        }

        imagepalettetotruecolor($image);

        return $image;
    }

    private static function stampAndSave(GdImage $image, string $path): string
    {
        $disk = Storage::disk('public');
        $settings = self::settings();

        if (($settings['watermark_enabled'] ?? true) === false) {
            imagedestroy($image);

            return $path;
        }

        self::stamp($image, $settings);

        $target = self::webpPath($path);
        ob_start();
        imagewebp($image, null, self::FULL_QUALITY);
        $contents = (string) ob_get_clean();
        imagedestroy($image);

        $temporary = $target.'.tmp';
        $written = $disk->put($temporary, $contents, 'public');

        if (! $written || ! @rename($disk->path($temporary), $disk->path($target))) {
            $disk->delete($temporary);
            Log::warning('Gallery watermark failed: cannot write file', ['file' => $target]);

            return $path;
        }

        if ($target !== $path) {
            $disk->move(self::thumbPath($path), self::thumbPath($target));
            $disk->delete($path);
        }

        $disk->put(self::markerPath($target), '');

        return $target;
    }

    private static function saveThumb(Filesystem $disk, GdImage $image, string $path): void
    {
        $width = imagesx($image);
        $height = imagesy($image);
        $scale = min(1.0, self::THUMB_MAX / max($width, $height));
        $thumbWidth = max(1, (int) round($width * $scale));
        $thumbHeight = max(1, (int) round($height * $scale));
        $thumb = imagecreatetruecolor($thumbWidth, $thumbHeight);
        imagecopyresampled($thumb, $image, 0, 0, 0, 0, $thumbWidth, $thumbHeight, $width, $height);

        ob_start();
        imagewebp($thumb, null, self::THUMB_QUALITY);
        $disk->put(self::thumbPath($path), (string) ob_get_clean(), 'public');
        imagedestroy($thumb);
    }

    private static function stamp(GdImage $image, array $settings): void
    {
        $mark = self::watermarkImage($settings['watermark'] ?? null);

        if (! $mark instanceof GdImage) {
            return;
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $ratio = self::SIZES[$settings['watermark_size'] ?? ''] ?? self::SIZES['medium'];
        $markWidth = max(60, (int) round($width * $ratio));
        $markHeight = (int) round($markWidth * imagesy($mark) / imagesx($mark));
        $x = $width - $markWidth - (int) round($width * self::RIGHT);
        $y = $height - $markHeight - (int) round($height * self::BOTTOM);

        imagealphablending($image, true);
        imagecopyresampled($image, $mark, $x, $y, 0, 0, $markWidth, $markHeight, imagesx($mark), imagesy($mark));
        imagedestroy($mark);
    }

    private static function watermarkImage(?string $custom): ?GdImage
    {
        $disk = Storage::disk('public');

        if ($custom && preg_match('/\.(png|webp)$/i', $custom) && $disk->exists($custom)) {
            $mark = @imagecreatefromstring((string) $disk->get($custom));

            if ($mark instanceof GdImage) {
                return $mark;
            }
        }

        $default = resource_path('watermark/watermark.png');

        return is_file($default) ? imagecreatefrompng($default) : null;
    }

    private static function settings(): array
    {
        $data = PageContent::where('key', 'site_settings')->first()?->data;

        return is_array($data) ? $data : [];
    }

    private static function webpPath(string $path): string
    {
        $dir = pathinfo($path, PATHINFO_DIRNAME);
        $name = pathinfo($path, PATHINFO_FILENAME).'.webp';

        return $dir && $dir !== '.' ? "{$dir}/{$name}" : $name;
    }
}
