<?php

namespace Tests\Feature;

use App\Filament\Resources\NewsItems\Pages\EditNewsItem;
use App\Models\NewsItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class RichEditorFormattingTest extends TestCase
{
    use RefreshDatabase;

    public function test_font_size_and_color_formatting_survive_saving(): void
    {
        $this->actingAs(User::factory()->create());
        $item = NewsItem::create(['title' => ['ru' => 'Новость'], 'slug' => 'n', 'is_published' => true, 'published_at' => now()]);

        $html = '<p>Обычный <span data-font="serif">Playfair</span> <span class="color" data-color="#ff0000">красный</span> <mark>маркер</mark></p><div class="lead"><p>Крупный</p></div><p><small>мелкий</small></p><h1>Заголовок</h1>';

        Livewire::test(EditNewsItem::class, ['record' => $item->getRouteKey()])
            ->fillForm(['ru.body' => $html])
            ->call('save')
            ->assertHasNoFormErrors();

        $body = $item->fresh()->getTranslation('body', 'ru');
        fwrite(STDERR, $body);
        $this->assertStringContainsString('data-font="serif"', $body);
        $this->assertStringContainsString('data-color="#ff0000"', $body);
        $this->assertStringContainsString('<mark', $body);
        $this->assertStringContainsString('class="lead"', $body);
        $this->assertStringContainsString('<small>', $body);
    }
}
