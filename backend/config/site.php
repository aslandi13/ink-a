<?php

return [
    'url' => explode(',', (string) env('FRONTEND_URL', 'http://localhost:5173'))[0],
    'index_path' => env('FRONTEND_INDEX_PATH', base_path('../frontend/dist/index.html')),
];
