<?php

namespace Tests\Feature;

use App\Models\PageContent;
use App\Models\Project;
use App\Support\CoverThumb;
use App\Support\WebImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CoverThumbTest extends TestCase
{
    use RefreshDatabase;

    public function test_saving_a_project_creates_a_card_thumbnail_used_by_the_list(): void
    {
        Storage::fake('public');
        $image = imagecreatetruecolor(2400, 1350);
        ob_start();
        imagejpeg($image);
        Storage::disk('public')->put('projects/cover.jpg', (string) ob_get_clean());

        Project::create(['title' => ['ru' => 'Дом'], 'slug' => 'house', 'category' => 'architecture', 'cover_image' => 'projects/cover.jpg', 'is_published' => true, 'sort_order' => 1]);

        Storage::disk('public')->assertExists('projects/cover-card.webp');
        [$width] = getimagesizefromstring(Storage::disk('public')->get('projects/cover-card.webp'));
        $this->assertSame(CoverThumb::MAX_WIDTH, $width);
        [$webWidth] = getimagesizefromstring(Storage::disk('public')->get('projects/cover-web.webp'));
        $this->assertSame(WebImage::MAX_WIDTH, $webWidth);

        $this->getJson('/api/ru/projects')
            ->assertJsonPath('data.0.cover_thumb', Storage::disk('public')->url('projects/cover-card.webp'))
            ->assertJsonPath('data.0.cover_image', Storage::disk('public')->url('projects/cover-web.webp'));
    }

    public function test_small_images_keep_the_original(): void
    {
        Storage::fake('public');
        $image = imagecreatetruecolor(1200, 800);
        ob_start();
        imagejpeg($image);
        Storage::disk('public')->put('approach/step.jpg', (string) ob_get_clean());

        PageContent::create(['key' => 'approach', 'data' => ['architecture' => ['steps' => [['image' => 'approach/step.jpg']]]]]);

        Storage::disk('public')->assertMissing('approach/step-web.webp');
        $this->assertSame('approach/step.jpg', WebImage::prefer('approach/step.jpg'));
    }

    public function test_web_video_copy_is_preferred_when_present(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('home/hero.mp4', 'a');

        $this->assertSame('home/hero.mp4', WebImage::prefer('home/hero.mp4'));

        Storage::disk('public')->put('home/hero-web.mp4', 'b');

        $this->assertSame('home/hero-web.mp4', WebImage::prefer('home/hero.mp4'));
        $this->assertSame('home/hero-web.mp4', WebImage::prefer('home/hero-web.mp4'));
    }
}
