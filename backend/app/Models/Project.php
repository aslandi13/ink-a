<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Project extends Model
{
    use HasTranslations;

    public array $translatable = ['title', 'excerpt', 'body'];

    protected $fillable = [
        'title',
        'slug',
        'category',
        'cover_image',
        'cover_focus',
        'gallery',
        'excerpt',
        'body',
        'location',
        'site_area',
        'total_area',
        'status',
        'year',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'gallery' => 'array',
    ];
}
