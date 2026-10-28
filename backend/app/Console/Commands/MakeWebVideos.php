<?php

namespace App\Console\Commands;

use App\Support\WebImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;

class MakeWebVideos extends Command
{
    protected $signature = 'videos:web {--force : Recreate existing copies}';

    protected $description = 'Create compressed 1080p web copies of uploaded mp4 videos';

    public function handle(): int
    {
        $disk = Storage::disk('public');
        $made = 0;

        foreach ($disk->allFiles() as $file) {
            if (strtolower(pathinfo($file, PATHINFO_EXTENSION)) !== 'mp4' || str_ends_with(pathinfo($file, PATHINFO_FILENAME), '-web')) {
                continue;
            }

            $target = WebImage::videoPath($file);

            if ($disk->exists($target) && ! $this->option('force')) {
                continue;
            }

            $temp = $disk->path($target).'.tmp.mp4';
            $result = Process::timeout(1800)->run([
                'ffmpeg', '-y', '-i', $disk->path($file),
                '-vf', "scale='min(1920,iw)':-2",
                '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart',
                $temp,
            ]);

            if (! $result->successful() || ! is_file($temp) || filesize($temp) >= $disk->size($file)) {
                @unlink($temp);
                $this->warn("Skipped {$file}");

                continue;
            }

            rename($temp, $disk->path($target));
            $made++;
            $this->line(sprintf('%s: %.1f MB -> %.1f MB', $file, $disk->size($file) / 1048576, $disk->size($target) / 1048576));
        }

        $this->info("Created {$made} web videos.");

        return self::SUCCESS;
    }
}
