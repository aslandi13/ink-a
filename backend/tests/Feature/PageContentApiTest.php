<?php

namespace Tests\Feature;

use App\Models\PageContent;
use App\Models\TeamMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PageContentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_missing_content_is_not_found(): void
    {
        PageContent::where('key', 'contacts')->delete();

        $this->getJson('/api/ru/contacts')->assertNotFound();
    }

    public function test_content_is_returned_for_locale(): void
    {
        PageContent::updateOrCreate(['key' => 'contacts'], ['data' => ['heading' => ['ru' => 'Контакты', 'en' => 'Contacts']]]);

        $this->getJson('/api/en/contacts')
            ->assertOk()
            ->assertJsonPath('data.heading', 'Contacts');
    }

    public function test_team_contains_only_published_members(): void
    {
        PageContent::updateOrCreate(['key' => 'about.team'], ['data' => []]);
        TeamMember::create(['name' => 'Иван', 'is_published' => true, 'sort_order' => 1]);
        TeamMember::create(['name' => 'Скрыт', 'is_published' => false, 'sort_order' => 2]);

        $this->getJson('/api/ru/about/team')
            ->assertOk()
            ->assertJsonCount(1, 'data.members')
            ->assertJsonPath('data.members.0.name', 'Иван');
    }

    public function test_team_and_founder_names_are_translated(): void
    {
        PageContent::updateOrCreate(['key' => 'about.team'], ['data' => []]);
        TeamMember::create(['name' => ['ru' => 'Иван', 'en' => 'Ivan'], 'is_published' => true, 'sort_order' => 1]);
        PageContent::updateOrCreate(['key' => 'about.founder'], ['data' => \App\Filament\Pages\Content\AboutFounder::prepareData([
            'name' => 'Нурлан Камитов',
            'en' => ['name' => 'Nurlan Kamitov'],
        ])]);

        $this->getJson('/api/en/about/team')->assertJsonPath('data.members.0.name', 'Ivan');
        $this->getJson('/api/kz/about/team')->assertJsonPath('data.members.0.name', 'Иван');
        $this->getJson('/api/en/about/founder')->assertJsonPath('data.name', 'Nurlan Kamitov');
        $this->getJson('/api/ru/about/founder')->assertJsonPath('data.name', 'Нурлан Камитов');
    }

    public function test_hero_slides_are_uploaded_photos_with_translated_captions(): void
    {
        PageContent::updateOrCreate(['key' => 'home.hero'], ['data' => [
            'slide_project_ids' => [1, 2],
            'hero_slides' => [
                ['image' => 'home/hero/one.webp', 'ru' => ['caption' => 'Алматы'], 'en' => ['caption' => 'Almaty']],
                ['image' => 'home/hero/two.webp'],
                ['image' => null, 'ru' => ['caption' => 'Пусто']],
            ],
        ]]);

        $this->getJson('/api/en/home/hero')
            ->assertOk()
            ->assertJsonCount(2, 'data.slides')
            ->assertJsonPath('data.slides.0.image', url('storage/home/hero/one.webp'))
            ->assertJsonPath('data.slides.0.title', 'Almaty')
            ->assertJsonPath('data.slides.1.title', null)
            ->assertJsonMissingPath('data.slide_project_ids');
        $this->getJson('/api/kz/home/hero')->assertJsonPath('data.slides.0.title', 'Алматы');
    }

    public function test_unpublished_built_in_page_is_empty_not_missing(): void
    {
        $this->getJson('/api/ru/pages/contacts')->assertOk()->assertJsonPath('data', null);
        $this->getJson('/api/ru/pages/some-custom-page')->assertNotFound();
    }
}
