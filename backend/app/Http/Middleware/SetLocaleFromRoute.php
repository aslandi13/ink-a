<?php

namespace App\Http\Middleware;

use App\Support\Locales;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocaleFromRoute
{
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->route('locale');

        if (! Locales::isValid($locale)) {
            $locale = Locales::DEFAULT;
        }

        app()->setLocale($locale);

        return $next($request);
    }
}
