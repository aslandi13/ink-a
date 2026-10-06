<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('photo')->nullable();
            $table->json('position')->nullable();
            $table->json('credentials')->nullable();
            $table->boolean('is_published')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        $record = DB::table('page_contents')->where('key', 'about.team')->first();
        $data = $record ? json_decode($record->data ?? '[]', true) : [];
        $members = is_array($data['members'] ?? null) ? $data['members'] : [];

        foreach (array_values($members) as $index => $member) {
            if (blank($member['name'] ?? null)) {
                continue;
            }

            $translated = fn (string $field) => json_encode(collect(['ru', 'kz', 'en'])
                ->mapWithKeys(fn (string $locale) => [$locale => $member[$locale][$field] ?? ($locale === 'ru' ? ($member[$field] ?? null) : null)])
                ->all(), JSON_UNESCAPED_UNICODE);

            DB::table('team_members')->insert([
                'name' => $member['name'],
                'photo' => $member['photo'] ?? null,
                'position' => $translated('position'),
                'credentials' => $translated('credentials'),
                'is_published' => true,
                'sort_order' => $index + 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
