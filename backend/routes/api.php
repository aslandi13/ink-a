<?php

use App\Http\Controllers\Api\EditorController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\PageContentController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Middleware\SetLocaleFromRoute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('pages/{slug}', [PageController::class, 'show']);

Route::prefix('editor')->group(function () {
    Route::post('login', [EditorController::class, 'login'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('pages/{slug}', [EditorController::class, 'show']);
        Route::put('pages/{slug}', [EditorController::class, 'update']);
        Route::post('pages/{slug}/publish', [EditorController::class, 'publish']);
        Route::post('pages/{slug}/unpublish', [EditorController::class, 'unpublish']);
        Route::post('assets', [EditorController::class, 'upload']);
        Route::patch('content', [EditorController::class, 'content']);
    });
});

Route::prefix('{locale}')->middleware(SetLocaleFromRoute::class)->group(function () {
    Route::get('home/hero', PageContentController::class)->defaults('key', 'home.hero');
    Route::get('home/about', PageContentController::class)->defaults('key', 'home.about');
    Route::get('home/offices', PageContentController::class)->defaults('key', 'home.offices');
    Route::get('home/video-banner', PageContentController::class)->defaults('key', 'home.video_banner');
    Route::get('home/key-projects', PageContentController::class)->defaults('key', 'home.key_projects');

    Route::get('approach', PageContentController::class)->defaults('key', 'approach');

    Route::get('about/history', PageContentController::class)->defaults('key', 'about.history');
    Route::get('about/team', PageContentController::class)->defaults('key', 'about.team');
    Route::get('about/founder', PageContentController::class)->defaults('key', 'about.founder');

    Route::get('contacts', PageContentController::class)->defaults('key', 'contacts');
    Route::get('settings', PageContentController::class)->defaults('key', 'site_settings');
    Route::get('legal', PageContentController::class)->defaults('key', 'legal');

    Route::get('projects', [ProjectController::class, 'index']);
    Route::get('projects/{slug}', [ProjectController::class, 'show']);

    Route::get('news', [NewsController::class, 'index']);
    Route::get('news/{slug}', [NewsController::class, 'show']);

    Route::get('project-template', [PageController::class, 'projectTemplate']);
    Route::get('news-template', [PageController::class, 'newsTemplate']);
    Route::get('menu-pages', [PageController::class, 'menu']);
    Route::get('pages/{slug}', [PageController::class, 'localized']);
});
