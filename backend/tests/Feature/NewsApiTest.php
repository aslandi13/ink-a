<?php

namespace Tests\Feature;

use App\Models\NewsItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsApiTest extends TestCase
{
    use RefreshDatabase;

    private function news(array $attributes = []): NewsItem
    {
        return NewsItem::create(array_merge([
            'title' => ['ru' => 'Новость'],
            'slug' => 'news',
            'is_published' => true,
            'published_at' => now()->subDay(),
            'sort_order' => 0,
        ], $attributes));
    }

    public function test_list_hides_unpublished_and_future_news(): void
    {
        $this->news();
        $this->news(['slug' => 'draft', 'is_published' => false]);
        $this->news(['slug' => 'future', 'published_at' => now()->addDay()]);

        $this->getJson('/api/ru/news')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'news');
    }

    public function test_show_returns_published_news(): void
    {
        $this->news();

        $this->getJson('/api/ru/news/news')
            ->assertOk()
            ->assertJsonPath('data.slug', 'news');
    }

    public function test_show_hides_draft(): void
    {
        $this->news(['is_published' => false]);

        $this->getJson('/api/ru/news/news')->assertNotFound();
    }
}
