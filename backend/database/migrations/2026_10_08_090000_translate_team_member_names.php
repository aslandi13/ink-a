<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('team_members', function (Blueprint $table) {
            $table->text('name')->change();
        });

        DB::table('team_members')->orderBy('id')->each(function (object $member) {
            $decoded = json_decode((string) $member->name, true);
            if (is_array($decoded)) {
                return;
            }
            DB::table('team_members')->where('id', $member->id)->update([
                'name' => json_encode(['ru' => (string) $member->name], JSON_UNESCAPED_UNICODE),
            ]);
        });
    }

    public function down(): void
    {
        DB::table('team_members')->orderBy('id')->each(function (object $member) {
            $decoded = json_decode((string) $member->name, true);
            DB::table('team_members')->where('id', $member->id)->update([
                'name' => is_array($decoded) ? ($decoded['ru'] ?? reset($decoded) ?: '') : $member->name,
            ]);
        });

        Schema::table('team_members', function (Blueprint $table) {
            $table->string('name')->change();
        });
    }
};
