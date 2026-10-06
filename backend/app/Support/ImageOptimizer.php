<?php

namespace App\Support;

use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Support\Facades\Log;
use Throwable;

class ImageOptimizer
{
    /**
     * Max dimension (width or height) in pixels.
     * 2048px is standard for high-res web displays (Retina/4K).
     */
    public const MAX_DIMENSION = 3000;

    /**
     * WebP output quality (0-100).
     * 82 gives excellent visual fidelity while cutting file size by 80-95%.
     */
    public const QUALITY = 90;

    /**
     * Optimizes an image stored on disk:
     * - Downscales if width or height exceeds MAX_DIMENSION.
     * - Auto-fixes EXIF rotation (from phones/cameras).
     * - Converts to WebP format.
     * - Removes heavy original file and returns the optimized relative path.
     */
    public static function optimizeStoredFile(mixed $disk, string $relativePath): string
    {
        try {
            $ext = strtolower(pathinfo($relativePath, PATHINFO_EXTENSION));

            // Only process standard raster images. Skip SVG, videos, PDFs, etc.
            if (! in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                return $relativePath;
            }

            if (! method_exists($disk, 'path')) {
                return $relativePath;
            }

            $fullPath = $disk->path($relativePath);

            if (! file_exists($fullPath) || ! is_readable($fullPath)) {
                return $relativePath;
            }

            $fileContents = file_get_contents($fullPath);
            if ($fileContents === false) {
                return $relativePath;
            }

            $src = @imagecreatefromstring($fileContents);
            if (! $src) {
                return $relativePath;
            }

            // Fix EXIF orientation for JPEGs
            if (in_array($ext, ['jpg', 'jpeg'], true) && function_exists('exif_read_data')) {
                $exif = @exif_read_data($fullPath);
                if (! empty($exif['Orientation'])) {
                    switch ($exif['Orientation']) {
                        case 3:
                            $src = imagerotate($src, 180, 0);
                            break;
                        case 6:
                            $src = imagerotate($src, -90, 0);
                            break;
                        case 8:
                            $src = imagerotate($src, 90, 0);
                            break;
                    }
                }
            }

            $origW = imagesx($src);
            $origH = imagesy($src);

            if ($origW <= 0 || $origH <= 0) {
                imagedestroy($src);
                return $relativePath;
            }

            // Calculate scaled dimensions if larger than MAX_DIMENSION
            $scale = min(1.0, self::MAX_DIMENSION / max($origW, $origH));
            $targetW = (int) round($origW * $scale);
            $targetH = (int) round($origH * $scale);

            // Create target image with transparency preservation
            $dst = imagecreatetruecolor($targetW, $targetH);
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
            imagefilledrectangle($dst, 0, 0, $targetW, $targetH, $transparent);

            imagecopyresampled($dst, $src, 0, 0, 0, 0, $targetW, $targetH, $origW, $origH);
            imagedestroy($src);

            // Target relative path with .webp extension
            $dir = pathinfo($relativePath, PATHINFO_DIRNAME);
            $filename = pathinfo($relativePath, PATHINFO_FILENAME);
            $newRelativePath = ($dir && $dir !== '.') ? "{$dir}/{$filename}.webp" : "{$filename}.webp";
            $newFullPath = $disk->path($newRelativePath);

            $saved = imagewebp($dst, $newFullPath, self::QUALITY);
            imagedestroy($dst);

            if ($saved) {
                // If the old file had a different path/extension, remove it
                if ($fullPath !== $newFullPath && file_exists($fullPath)) {
                    @unlink($fullPath);
                }

                // Ensure proper visibility on disk if supported
                if (method_exists($disk, 'setVisibility')) {
                    rescue(fn () => $disk->setVisibility($newRelativePath, 'public'), report: false);
                }

                return $newRelativePath;
            }

            return $relativePath;
        } catch (Throwable $e) {
            Log::warning('Image optimization failed, keeping original: ' . $e->getMessage(), [
                'file' => $relativePath,
            ]);

            return $relativePath;
        }
    }
}
