<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['title', 'excerpt', 'body']);
        });
        Schema::table('projects', function (Blueprint $table) {
            $table->json('title')->after('id');
            $table->json('excerpt')->nullable()->after('category');
            $table->json('body')->nullable()->after('excerpt');
        });

        Schema::table('news_items', function (Blueprint $table) {
            $table->dropColumn(['title', 'excerpt', 'body']);
        });
        Schema::table('news_items', function (Blueprint $table) {
            $table->json('title')->after('id');
            $table->json('excerpt')->nullable()->after('cover_image');
            $table->json('body')->nullable()->after('excerpt');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['title', 'excerpt', 'body']);
        });
        Schema::table('projects', function (Blueprint $table) {
            $table->string('title')->after('id');
            $table->text('excerpt')->nullable()->after('category');
            $table->longText('body')->nullable()->after('excerpt');
        });

        Schema::table('news_items', function (Blueprint $table) {
            $table->dropColumn(['title', 'excerpt', 'body']);
        });
        Schema::table('news_items', function (Blueprint $table) {
            $table->string('title')->after('id');
            $table->text('excerpt')->nullable()->after('cover_image');
            $table->longText('body')->nullable()->after('excerpt');
        });
    }
};
