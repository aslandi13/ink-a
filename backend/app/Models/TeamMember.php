<?php

namespace App\Models;

use App\Support\WebImage;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class TeamMember extends Model
{
    use HasTranslations;

    public array $translatable = ['name', 'position', 'credentials'];

    protected $fillable = ['name', 'photo', 'position', 'credentials', 'is_published', 'sort_order'];

    protected $casts = [
        'is_published' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::saved(fn (self $model) => WebImage::makeAll($model->photo));
    }
}
