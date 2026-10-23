<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Support\CoverThumb;
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

        $this->getJson('/api/ru/projects')
            ->assertJsonPath('data.0.cover_thumb', Storage::disk('public')->url('projects/cover-card.webp'))
            ->assertJsonPath('data.0.cover_image', Storage::disk('public')->url('projects/cover.jpg'));
    }
}
