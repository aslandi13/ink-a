<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = ['slug', 'draft', 'published', 'published_at'];

    protected function casts(): array
    {
        return [
            'draft' => 'array',
            'published' => 'array',
            'published_at' => 'datetime',
        ];
    }
}
