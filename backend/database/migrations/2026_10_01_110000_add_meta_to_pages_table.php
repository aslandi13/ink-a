<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->json('title')->nullable()->after('slug');
            $table->json('seo_title')->nullable()->after('title');
            $table->json('seo_description')->nullable()->after('seo_title');
            $table->boolean('show_in_menu')->default(false)->after('seo_description');
            $table->unsignedInteger('menu_order')->default(0)->after('show_in_menu');
        });

        $title = json_encode(['ru' => 'Главная', 'kz' => 'Басты бет', 'en' => 'Home'], JSON_UNESCAPED_UNICODE);

        if (DB::table('pages')->where('slug', 'home')->exists()) {
            DB::table('pages')->where('slug', 'home')->update(['title' => $title]);
        } else {
            DB::table('pages')->insert(['slug' => 'home', 'title' => $title, 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->dropColumn(['title', 'seo_title', 'seo_description', 'show_in_menu', 'menu_order']);
        });
    }
};
