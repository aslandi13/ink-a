<?php

namespace App\Models;

use App\Observers\ProjectObserver;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

#[ObservedBy([ProjectObserver::class])]
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
        'total_apartments',
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
