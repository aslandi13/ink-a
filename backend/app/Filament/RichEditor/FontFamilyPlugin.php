<?php

namespace App\Filament\RichEditor;

use Filament\Actions\Action;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\RichEditor\EditorCommand;
use Filament\Forms\Components\RichEditor\Plugins\Contracts\RichContentPlugin;
use Filament\Forms\Components\RichEditor\RichEditorTool;
use Filament\Forms\Components\TextInput;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;

class FontFamilyPlugin implements RichContentPlugin
{
    public static function make(): static
    {
        return app(static::class);
    }

    public function getTipTapPhpExtensions(): array
    {
        return [app(FontFamilyExtension::class), app(YoutubeExtension::class)];
    }

    public function getTipTapJsExtensions(): array
    {
        return collect(['font-family', 'heading-guard', 'youtube'])
            ->map(fn (string $file) => asset("js/ink/{$file}.js").'?v='.filemtime(public_path("js/ink/{$file}.js")))
            ->all();
    }

    public function getEditorTools(): array
    {
        return [
            RichEditorTool::make('fontSerif')
                ->label('Playfair')
                ->hiddenLabel(false)
                ->jsHandler('$getEditor()?.chain().focus().setFontFamily(\'serif\').run()')
                ->activeKey('fontFamily')
                ->activeOptions(['font' => 'serif']),
            RichEditorTool::make('youtube')
                ->label('YouTube')
                ->icon(Heroicon::OutlinedPlayCircle)
                ->action(),
            RichEditorTool::make('fontSans')
                ->label('Manrope')
                ->hiddenLabel(false)
                ->jsHandler('$getEditor()?.chain().focus().setFontFamily(\'sans\').run()')
                ->activeJsExpression('!$getEditor()?.isActive(\'fontFamily\')'),
        ];
    }

    public function getEditorActions(): array
    {
        return [
            Action::make('youtube')
                ->modalHeading('Видео YouTube')
                ->modalWidth(Width::Large)
                ->modalSubmitActionLabel('Вставить')
                ->schema([
                    TextInput::make('url')
                        ->label('Ссылка на видео')
                        ->placeholder('https://www.youtube.com/watch?v=...')
                        ->helperText('Обычная ссылка из адресной строки или кнопки «Поделиться»')
                        ->required()
                        ->rule(fn () => function (string $attribute, mixed $value, \Closure $fail): void {
                            if (! YoutubeExtension::embedUrl((string) $value)) {
                                $fail('Это не ссылка на видео YouTube.');
                            }
                        }),
                ])
                ->action(function (array $arguments, array $data, RichEditor $component): void {
                    $component->runCommands(
                        [EditorCommand::make('setYoutubeVideo', arguments: [['src' => YoutubeExtension::embedUrl($data['url'])]])],
                        editorSelection: $arguments['editorSelection'],
                    );
                }),
        ];
    }
}
