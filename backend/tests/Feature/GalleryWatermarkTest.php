<?php

namespace Tests\Feature;

use App\Support\GalleryWatermark;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GalleryWatermarkTest extends TestCase
{
    use RefreshDatabase;

    private function jpeg(string $path, int $width = 2400, int $height = 1600): void
    {
        $image = imagecreatetruecolor($width, $height);
        ob_start();
        imagejpeg($image);
        Storage::disk('public')->put($path, (string) ob_get_clean());
        imagedestroy($image);
    }

    public function test_process_creates_thumb_and_stamped_webp(): void
    {
        Storage::fake('public');
        $this->jpeg('projects/gallery/photo.jpg');

        $result = GalleryWatermark::process('projects/gallery/photo.jpg');

        $this->assertSame('projects/gallery/photo.webp', $result);
        Storage::disk('public')->assertExists('projects/gallery/photo.webp');
        Storage::disk('public')->assertExists('projects/gallery/photo-thumb.webp');
        Storage::disk('public')->assertMissing('projects/gallery/photo.jpg');
        $this->assertTrue(GalleryWatermark::isStamped($result));
    }

    public function test_thumb_is_limited_in_size(): void
    {
        Storage::fake('public');
        $this->jpeg('photo.jpg');

        GalleryWatermark::process('photo.jpg');

        [$width, $height] = getimagesizefromstring(Storage::disk('public')->get('photo-thumb.webp'));
        $this->assertSame(GalleryWatermark::THUMB_MAX, max($width, $height));
    }

    public function test_process_is_idempotent(): void
    {
        Storage::fake('public');
        $this->jpeg('photo.jpg');

        $first = GalleryWatermark::process('photo.jpg');
        $contents = Storage::disk('public')->get($first);

        $this->assertSame($first, GalleryWatermark::process($first));
        $this->assertSame($first, GalleryWatermark::stampExisting($first));
        $this->assertSame($contents, Storage::disk('public')->get($first));
    }

    public function test_missing_file_is_left_untouched(): void
    {
        Storage::fake('public');

        $this->assertSame('nope.jpg', GalleryWatermark::process('nope.jpg'));
    }
}
