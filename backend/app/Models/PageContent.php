<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PageContent extends Model
{
    protected $fillable = ['key', 'data'];

    protected $casts = [
        'data' => 'array',
    ];
}
