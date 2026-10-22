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
        $this->assertStringContainsString('data-font="serif"', $body);
        $this->assertStringContainsString('data-color="#ff0000"', $body);
        $this->assertStringContainsString('<mark', $body);
        $this->assertStringContainsString('class="lead"', $body);
        $this->assertStringContainsString('<small>', $body);
    }

    public function test_youtube_video_survives_saving(): void
    {
        $this->actingAs(User::factory()->create());
        $item = NewsItem::create(['title' => ['ru' => 'Новость'], 'slug' => 'v', 'is_published' => true, 'published_at' => now()]);

        $html = '<p>До</p><div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" width="640" height="360"></iframe></div><p>После</p><iframe src="https://evil.example/x"></iframe>';

        Livewire::test(EditNewsItem::class, ['record' => $item->getRouteKey()])
            ->fillForm(['ru.body' => $html])
            ->call('save')
            ->assertHasNoFormErrors();

        $body = $item->fresh()->getTranslation('body', 'ru');
        $this->assertStringContainsString('<div data-youtube-video="true"><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"', $body);
        $this->assertStringNotContainsString('evil.example', $body);
    }

    public function test_youtube_links_are_normalised(): void
    {
        $this->assertSame('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', \App\Filament\RichEditor\YoutubeExtension::embedUrl('https://youtu.be/dQw4w9WgXcQ?si=abc'));
        $this->assertSame('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', \App\Filament\RichEditor\YoutubeExtension::embedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10'));
        $this->assertNull(\App\Filament\RichEditor\YoutubeExtension::embedUrl('https://vimeo.com/123'));
    }
}
