# ink-a

Monorepo: Laravel API backend + React SPA frontend.

- [`backend/`](backend) — Laravel 13 API (Sanctum auth, Filament admin panel).
- [`frontend/`](frontend) — React + TypeScript + Vite SPA, talks to the backend via `backend/src/lib/api.ts`-style axios client.

## Setup

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
composer run dev   # or: php artisan serve
```

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The backend serves the API on `http://localhost:8000`, the frontend dev server runs on `http://localhost:5173` (Vite default). CORS and Sanctum stateful domains are already configured for this pairing in `backend/config/cors.php` and `backend/.env`.
