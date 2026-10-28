<?php

namespace App\Models;

use App\Support\WebImage;
use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    protected $fillable = ['key', 'data'];

    protected $casts = [
        'data' => 'array',
    ];

    protected static function booted(): void
    {
        static::saved(fn (self $model) => WebImage::makeAll($model->data));
    }
}
