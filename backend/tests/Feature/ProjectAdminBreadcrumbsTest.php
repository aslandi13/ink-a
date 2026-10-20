<?php

namespace Tests\Feature;

use App\Filament\Resources\Projects\Pages\ListProjects;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class ProjectAdminBreadcrumbsTest extends TestCase
{
    use RefreshDatabase;

    public function test_edit_page_shows_category_breadcrumb_and_project_title(): void
    {
        $this->actingAs(User::factory()->create());
        $project = Project::create(['title' => ['ru' => 'Дом у реки'], 'slug' => 'house', 'category' => 'engineering', 'is_published' => true, 'sort_order' => 1]);

        $this->get("/admin/projects/{$project->id}/edit")
            ->assertOk()
            ->assertSee('Рабочее проектирование')
            ->assertSee('Дом у реки')
            ->assertSee('/admin/projects?tab=engineering', false);

        $this->get('/admin/projects/create?category=interior')
            ->assertOk()
            ->assertSee('Дизайн интерьера')
            ->assertSee('/admin/projects?tab=interior', false);

        Livewire::withQueryParams(['tab' => 'engineering'])
            ->test(ListProjects::class)
            ->assertSet('activeTab', 'engineering')
            ->assertCanSeeTableRecords([$project]);
    }
}
