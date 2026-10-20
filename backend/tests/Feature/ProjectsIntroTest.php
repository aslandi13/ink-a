<?php

namespace Tests\Feature;

use App\Models\PageContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectsIntroTest extends TestCase
{
    use RefreshDatabase;

    public function test_intro_card_image_is_chosen_per_language(): void
    {
        PageContent::updateOrCreate(['key' => 'projects_intro'], ['data' => [
            'architecture' => ['enabled' => true, 'ru' => ['image' => 'projects/intro/ru.webp'], 'en' => ['image' => 'projects/intro/en.webp'], 'kz' => ['image' => null]],
            'interior' => ['enabled' => true, 'image' => 'projects/intro/old.webp'],
        ]]);

        $this->getJson('/api/en/projects-intro')
            ->assertJsonPath('data.architecture.image', url('storage/projects/intro/en.webp'))
            ->assertJsonPath('data.architecture.enabled', true)
            ->assertJsonPath('data.interior.image', url('storage/projects/intro/old.webp'));
        $this->getJson('/api/kz/projects-intro')->assertJsonPath('data.architecture.image', url('storage/projects/intro/ru.webp'));
    }
}
