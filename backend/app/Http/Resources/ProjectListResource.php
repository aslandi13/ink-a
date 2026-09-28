<?php

namespace App\Http\Resources;

use App\Support\FileUrlResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'category' => $this->category,
            'excerpt' => $this->excerpt,
            'location' => $this->location,
            'year' => $this->year,
            'cover_image' => FileUrlResolver::resolve($this->cover_image),
        ];
    }
}
