<?php

namespace App\Http\Resources;

use App\Support\FileUrlResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'body' => FileUrlResolver::html($this->body),
            'cover_image' => FileUrlResolver::resolve($this->cover_image),
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
