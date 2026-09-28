<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->string('site_area')->nullable()->after('location');
            $table->string('total_area')->nullable()->after('site_area');
            $table->string('status')->nullable()->after('total_area');
            $table->json('gallery')->nullable()->after('cover_image');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn(['site_area', 'total_area', 'status', 'gallery']);
        });
    }
};
