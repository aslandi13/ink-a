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
}
