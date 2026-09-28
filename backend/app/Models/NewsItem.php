<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class NewsItem extends Model
{
    use HasTranslations;

    public array $translatable = ['title', 'excerpt', 'body'];

    protected $fillable = [
        'title',
        'slug',
        'cover_image',
        'excerpt',
        'body',
        'published_at',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'is_published' => 'boolean',
        'sort_order'   => 'integer',
    ];
}
