<?php

namespace App\Support;

use GdImage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class WebImage
{
    public const MAX_WIDTH = 1920;

    public const QUALITY = 85;

    private const SUFFIXES = ['-web', '-card', '-thumb'];

    private const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];

    public static function path(string $source): string
    {
        $dir = pathinfo($source, PATHINFO_DIRNAME);
        $name = pathinfo($source, PATHINFO_FILENAME).'-web.webp';

        return $dir && $dir !== '.' ? "{$dir}/{$name}" : $name;
    }

    public static function supports(string $source): bool
    {
        if (! in_array(strtolower(pathinfo($source, PATHINFO_EXTENSION)), self::EXTENSIONS, true)) {
            return false;
        }

        $name = pathinfo($source, PATHINFO_FILENAME);

        foreach (self::SUFFIXES as $suffix) {
            if (str_ends_with($name, $suffix)) {
                return false;
            }
        }

        return true;
    }

    public static function videoPath(string $source): string
    {
        $dir = pathinfo($source, PATHINFO_DIRNAME);
        $name = pathinfo($source, PATHINFO_FILENAME).'-web.mp4';

        return $dir && $dir !== '.' ? "{$dir}/{$name}" : $name;
    }

    public static function prefer(string $source): string
    {
        if (strtolower(pathinfo($source, PATHINFO_EXTENSION)) === 'mp4') {
            if (str_ends_with(pathinfo($source, PATHINFO_FILENAME), '-web')) {
                return $source;
            }

            $video = self::videoPath($source);

            return Storage::disk('public')->exists($video) ? $video : $source;
        }

        if (! self::supports($source)) {
            return $source;
        }

        $variant = self::path($source);

        return Storage::disk('public')->exists($variant) ? $variant : $source;
    }

    public static function makeAll(mixed $data): int
    {
        if (is_array($data)) {
            return array_sum(array_map(fn (mixed $value) => self::makeAll($value), $data));
        }

        return is_string($data) && self::make($data) ? 1 : 0;
    }

    public static function make(?string $source): bool
    {
        if (blank($source) || strlen($source) > 255 || ! self::supports($source)) {
            return false;
        }

        $disk = Storage::disk('public');

        if (! $disk->exists($source)) {
            return false;
        }

        $variant = self::path($source);

        if ($disk->exists($variant) && $disk->lastModified($variant) >= $disk->lastModified($source)) {
            return false;
        }

        try {
            $size = @getimagesize($disk->path($source));
            if (! $size || $size[0] <= self::MAX_WIDTH) {
                $disk->delete($variant);

                return false;
            }

            $image = @imagecreatefromstring((string) $disk->get($source));
            if (! $image instanceof GdImage) {
                return false;
            }

            $width = imagesx($image);
            $height = imagesy($image);
            $newHeight = max(1, (int) round($height * self::MAX_WIDTH / $width));
            $resized = imagecreatetruecolor(self::MAX_WIDTH, $newHeight);
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
            imagecopyresampled($resized, $image, 0, 0, 0, 0, self::MAX_WIDTH, $newHeight, $width, $height);

            ob_start();
            imagewebp($resized, null, self::QUALITY);
            $written = $disk->put($variant, (string) ob_get_clean(), 'public');
            imagedestroy($resized);
            imagedestroy($image);

            return (bool) $written;
        } catch (Throwable $e) {
            Log::warning('Web image failed: '.$e->getMessage(), ['file' => $source]);

            return false;
        }
    }
}
