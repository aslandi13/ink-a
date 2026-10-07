<?php

namespace Tests\Feature;

use App\Filament\Pages\Content\Approach;
use App\Models\PageContent;
use App\Support\EditableContent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SharedImagesTest extends TestCase
{
    use RefreshDatabase;

    private function seedApproach(): void
    {
        PageContent::updateOrCreate(['key' => 'approach'], ['data' => [
            'architecture' => [
                'ru' => ['steps' => [['title' => 'Шаг', 'text' => 'Т', 'image' => 'approach/one.webp'], ['title' => 'Шаг 2', 'text' => 'Т', 'image' => 'approach/two.webp']]],
                'en' => ['steps' => [['title' => 'Step', 'text' => 'T', 'image' => 'approach/old.webp'], ['title' => 'Step 2', 'text' => 'T']]],
            ],
        ]]);
    }

    public function test_english_steps_use_russian_photos(): void
    {
        $this->seedApproach();

        $this->getJson('/api/en/approach')
            ->assertOk()
            ->assertJsonPath('data.architecture.steps.0.title', 'Step')
            ->assertJsonPath('data.architecture.steps.0.image', url('storage/approach/one.webp'))
            ->assertJsonPath('data.architecture.steps.1.image', url('storage/approach/two.webp'));
    }

    public function test_editor_photo_change_applies_to_all_languages(): void
    {
        $this->seedApproach();

        EditableContent::apply('en', [['key' => 'approach', 'field' => 'architecture.steps.0.image', 'value' => 'approach/new.webp']]);

        $this->assertSame('approach/new.webp', PageContent::where('key', 'approach')->first()->data['architecture']['ru']['steps'][0]['image']);
        $this->getJson('/api/kz/approach')->assertJsonPath('data.architecture.steps.0.image', url('storage/approach/new.webp'));
    }

    public function test_founder_icons_use_russian_icons(): void
    {
        PageContent::updateOrCreate(['key' => 'about.founder'], ['data' => [
            'name' => 'Имя',
            'ru' => ['credential_highlights' => [['text' => 'RU', 'icon' => 'about/founder/logo.webp']]],
            'en' => ['credential_highlights' => [['text' => 'EN']]],
        ]]);

        $this->getJson('/api/en/about/founder')
            ->assertJsonPath('data.credential_highlights.0.text', 'EN')
            ->assertJsonPath('data.credential_highlights.0.icon', url('storage/about/founder/logo.webp'));
    }

    public function test_default_caption_is_translated(): void
    {
        PageContent::updateOrCreate(['key' => 'approach'], ['data' => Approach::prepareData([
            'architecture' => ['default_image_caption' => 'Концепт', 'ru' => [], 'en' => ['default_image_caption' => 'Concept']],
        ])]);

        $this->getJson('/api/ru/approach')->assertJsonPath('data.architecture.default_image_caption', 'Концепт');
        $this->getJson('/api/en/approach')->assertJsonPath('data.architecture.default_image_caption', 'Concept');
        $this->getJson('/api/kz/approach')->assertJsonPath('data.architecture.default_image_caption', 'Концепт');
    }
}
