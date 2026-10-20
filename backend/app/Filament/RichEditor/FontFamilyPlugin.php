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
        return [asset('js/ink/font-family.js').'?v='.filemtime(public_path('js/ink/font-family.js'))];
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
