<?php

namespace App\Http\Resources;

use App\Support\FileUrlResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'category' => $this->category,
            'excerpt' => $this->excerpt,
            'body' => $this->body,
            'location' => $this->location,
            'site_area' => $this->site_area,
            'total_area' => $this->total_area,
            'status' => $this->status,
            'year' => $this->year,
            'cover_image' => FileUrlResolver::resolve($this->cover_image),
            'gallery' => FileUrlResolver::resolve($this->gallery ?? []),
        ];
    }
}
