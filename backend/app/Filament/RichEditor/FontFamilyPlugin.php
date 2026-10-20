<?php

namespace App\Filament\RichEditor;

use Filament\Forms\Components\RichEditor\Plugins\Contracts\RichContentPlugin;
use Filament\Forms\Components\RichEditor\RichEditorTool;

class FontFamilyPlugin implements RichContentPlugin
{
    public static function make(): static
    {
        return app(static::class);
    }

    public function getTipTapPhpExtensions(): array
    {
        return [app(FontFamilyExtension::class)];
    }

    public function getTipTapJsExtensions(): array
    {
        return collect(['font-family', 'heading-guard'])
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
            RichEditorTool::make('fontSans')
                ->label('Manrope')
                ->hiddenLabel(false)
                ->jsHandler('$getEditor()?.chain().focus().setFontFamily(\'sans\').run()')
                ->activeJsExpression('!$getEditor()?.isActive(\'fontFamily\')'),
        ];
    }

    public function getEditorActions(): array
    {
        return [];
    }
}
