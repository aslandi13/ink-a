<?php

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => explode(',', env('FRONTEND_URL', 'http://localhost:5173')),

    // Vite bumps to the next free port (5174, 5175...) whenever 5173 is
    // already in use, which broke CORS every time that happened. Any
    // localhost/127.0.0.1 port is allowed in local dev; production still
    // relies solely on FRONTEND_URL above.
    'allowed_origins_patterns' => env('APP_ENV') === 'local'
        ? ['#^http://(localhost|127\.0\.0\.1):\d+$#']
        : [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
