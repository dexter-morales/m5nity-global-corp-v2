# M5nity Global Corp Platform

## Overview

M5nity Global Corp is built on Laravel 12 with Inertia.js and a modern React 19 frontend, styled with Tailwind CSS 4 and Radix UI primitives. It delivers a membership platform with binary network management, cashier-driven onboarding, and comprehensive account controls in a single codebase.【F:composer.json†L11-L61】【F:package.json†L4-L62】【F:resources/js/components/app-logo.tsx†L3-L15】

### Key Features

- **Member binary dashboard** – visualises a member's genealogy tree, recent payouts, and available registration pins, including support for focusing on a specific downline account.【F:app/Http/Controllers/Members/MemberDashboardController.php†L17-L157】
- **Registration pin management** – lets members review pin inventory, filter by sponsor, and see assignment history for pending recruits.【F:app/Http/Controllers/Members/MemberPinController.php†L14-L65】
- **Guided downline placement** – validates pins, finds open binary slots, and records new genealogy entries while triggering binary pairing updates inside a single transaction.【F:app/Http/Controllers/Members/MemberRegistrationController.php†L18-L200】
- **Cashier onboarding workspace** – allows staff to pre-register members, generate pins and transaction history, and review recent activity alongside their staff profile details.【F:app/Http/Controllers/Cashier/CashierRegistrationController.php†L24-L175】
- **Account settings hub** – covers profile management, password rotation with current password verification, and optional Fortify-powered two-factor authentication prompts.【F:app/Http/Controllers/Settings/ProfileController.php†L16-L61】【F:app/Http/Controllers/Settings/PasswordController.php†L14-L37】【F:app/Http/Controllers/Settings/TwoFactorAuthenticationController.php†L15-L35】

## Tech Stack

- **Backend:** Laravel 12, Fortify authentication hardening, and Wayfinder for navigation scaffolding.【F:composer.json†L11-L61】
- **Frontend:** React 19 with Inertia.js, Vite 7, Tailwind CSS 4, and Radix UI components for accessible interfaces.【F:package.json†L4-L62】
- **Tooling:** PHP 8.2+, Composer, Node.js 20+, ESLint, Prettier, TypeScript, and a database-backed queue worker.【F:composer.json†L11-L61】【F:package.json†L4-L62】【F:.env.example†L23-L48】

## Getting Started

1. **Clone & install dependencies**
    ```bash
    composer install
    npm install
    ```
2. **Environment** – copy the example file, then adjust app, queue, and database settings (SQLite is enabled by default):
    ```bash
    cp .env.example .env
    ```
    Update `.env` to match your environment. SQLite works out of the box, but you can switch to MySQL/PostgreSQL by editing the `DB_` settings.【F:.env.example†L1-L48】
3. **Application key & database**
    ```bash
    php artisan key:generate
    php artisan migrate
    php artisan db:seed
    ```
    The default seeder loads master passwords, genealogy samples, staff profiles, and demo registration pins for immediate exploration.【F:database/seeders/DatabaseSeeder.php†L15-L24】

## Running the App

- **All-in-one dev loop** – run the API, queue worker, and Vite dev server together:
    ```bash
    composer run dev
    ```
    This command orchestrates `php artisan serve`, the database queue listener, and `npm run dev` via `concurrently`.【F:composer.json†L49-L57】
- **Manual control** – start each service yourself if you prefer more granular control:
    ```bash
    php artisan serve
    php artisan queue:listen --tries=1
    npm run dev
    ```

## Building for Production

Generate optimized assets with Vite:

```bash
npm run build
```

For server-side rendering, `npm run build:ssr` runs both the client and SSR builds.【F:package.json†L4-L11】

## Testing & Quality Checks

- Backend test suite:
    ```bash
    composer test
    ```
    Runs Laravel's test runner after clearing cached config.【F:composer.json†L58-L61】
- Frontend linting & type safety:
    ```bash
    npm run lint
    npm run types
    npm run format:check
    ```
    Uses ESLint, TypeScript, and Prettier with Tailwind-aware formatting to keep the React codebase consistent.【F:package.json†L4-L25】

## Additional Notes

- Queue, cache, and session drivers default to the database, so ensure migrations have been executed before starting workers.【F:.env.example†L23-L41】
- The project seeds sample binary tree data; you can tweak or add records via the seeders in `database/seeders/` to model custom hierarchies.【F:database/seeders/DatabaseSeeder.php†L15-L24】
- Generated registration pins include transaction numbers and kick-start tokens, making it easy to hand off onboarding steps between cashiers and members.【F:app/Http/Controllers/Cashier/CashierRegistrationController.php†L82-L175】
