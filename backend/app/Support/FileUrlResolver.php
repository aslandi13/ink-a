<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * FileUpload fields store just the relative path within the "public" disk.
 * This walks a resolved content array and turns any string that is actually
 * a stored file into its public URL, leaving plain text untouched.
 *
 * We intentionally skip the Storage::exists() check here: paths in the
 * database are written exclusively by our Filament admin panel, so we trust
 * them. Skipping the per-file filesystem round-trip keeps gallery requests
 * fast regardless of how many images are stored.
 */
class FileUrlResolver
{
    public static function resolve(mixed $data): mixed
    {
        if (is_array($data)) {
            return array_map(fn (mixed $value) => self::resolve($value), $data);
        }

        if (! self::looksLikeStoredPath($data)) {
            return $data;
        }

        return Storage::disk('public')->url($data);
    }

    private static function looksLikeStoredPath(mixed $value): bool
    {
        if (! is_string($value) || $value === '') {
            return false;
        }

        // Must be a short, single-line string without null bytes.
        if (str_contains($value, "\n") || str_contains($value, "\0") || strlen($value) > 255) {
            return false;
        }

        // Filament FileUpload always produces paths with a recognised file
        // extension (e.g. settings/logo.png, projects/cover.jpg).
        // Plain text values ("студий", "года опыта") never have extensions,
        // so we use this as the discriminator instead of a filesystem round-trip.
        $knownExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'mp4', 'mov', 'webm', 'pdf'];
        $ext = strtolower(pathinfo($value, PATHINFO_EXTENSION));

        return in_array($ext, $knownExtensions, true);
    }
}

