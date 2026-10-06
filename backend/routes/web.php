<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin');
});

Route::get('/__page/{path?}', \App\Http\Controllers\SitePageController::class)->where('path', '.*');
