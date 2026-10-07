<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    private function project(array $attributes = []): Project
    {
        return Project::create(array_merge([
            'title' => ['ru' => 'Дом', 'en' => 'House'],
            'slug' => 'house',
            'category' => 'architecture',
            'is_published' => true,
            'sort_order' => 1,
        ], $attributes));
    }

    public function test_list_returns_only_published_projects_of_category(): void
    {
        $this->project();
        $this->project(['slug' => 'hidden', 'is_published' => false]);
        $this->project(['slug' => 'park', 'category' => 'interior']);

        $this->getJson('/api/ru/projects?category=architecture')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'house')
            ->assertJsonPath('meta.total', 1);
    }

    public function test_list_is_sorted_by_sort_order(): void
    {
        $this->project(['slug' => 'second', 'sort_order' => 2]);
        $this->project(['slug' => 'first', 'sort_order' => 1]);

        $this->getJson('/api/ru/projects')
            ->assertOk()
            ->assertJsonPath('data.0.slug', 'first')
            ->assertJsonPath('data.1.slug', 'second');
    }

    public function test_show_in_category_returns_project(): void
    {
        $this->project();

        $this->getJson('/api/ru/projects/architecture/house')
            ->assertOk()
            ->assertJsonPath('data.slug', 'house');
    }

    public function test_show_in_wrong_category_is_not_found(): void
    {
        $this->project();

        $this->getJson('/api/ru/projects/interior/house')->assertNotFound();
    }

    public function test_unpublished_project_is_not_found(): void
    {
        $this->project(['is_published' => false]);

        $this->getJson('/api/ru/projects/architecture/house')->assertNotFound();
    }

    public function test_title_is_translated(): void
    {
        $this->project();

        $this->getJson('/api/en/projects/architecture/house')
            ->assertJsonPath('data.title', 'House');
    }
}
