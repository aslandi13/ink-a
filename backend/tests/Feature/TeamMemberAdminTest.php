<?php

namespace Tests\Feature;

use App\Filament\Resources\TeamMembers\Pages\EditTeamMember;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class TeamMemberAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_edit_form_shows_and_saves_translated_name(): void
    {
        $this->actingAs(User::factory()->create());
        $member = TeamMember::create(['name' => ['ru' => 'Иван'], 'position' => ['ru' => 'Архитектор'], 'is_published' => true, 'sort_order' => 1]);

        Livewire::test(EditTeamMember::class, ['record' => $member->getRouteKey()])
            ->assertSchemaStateSet(['ru.name' => 'Иван'])
            ->fillForm(['en.name' => 'Ivan'])
            ->call('save')
            ->assertHasNoFormErrors();

        $this->assertSame('Ivan', $member->fresh()->getTranslation('name', 'en'));
    }
}
