# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coffea Shop - a full-stack e-commerce platform for a coffee shop with three applications:
- **API** (`api/`): NestJS backend with PostgreSQL
- **Web** (`web/`): Next.js customer-facing storefront
- **Admin** (`admin/`): React admin dashboard with Material-UI

Each app has its own `CLAUDE.md` with detailed instructions.

## Development Setup

Start all services with Docker Compose from the project root:

```bash
docker compose up        # Start all services (postgres, api, web, admin, nginx frontend)
docker compose up -d     # Detached mode
docker compose down      # Stop all services
```

**Service URLs (via nginx on port 80):**
- Web: `http://localhost/` (proxies to web:3030)
- Admin: `http://localhost/admin` (proxies to admin:3010)
- API: `http://localhost/api` (proxies to api:3000)

**Direct service ports (bypass nginx):**
- PostgreSQL: `localhost:5432`
- API: `localhost:3020`
- Web: `localhost:3030`
- Admin: `localhost:3010`

**Environment:** Create `.env` in project root with `DATABASE_NAME`, `DATABASE_PASSWORD`, and `JWT_SECRET`.

**First-time setup:** The `init/init.sql` script automatically creates the `uuid-ossp` PostgreSQL extension and seeds admin user/group when the database container starts.

**Default admin credentials:** login `admin`, password `qwerty`

## Commands by App

### API (`cd api`)
```bash
npm run start:dev                                    # Watch mode
npm run test                                         # Unit tests
npm run test -- --testPathPattern="<pattern>"        # Single test
npm run test:e2e                                     # E2E tests
npm run lint                                         # ESLint
```

### Web (`cd web`)
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
```

### Admin (`cd admin`)
```bash
npm start        # Development server (localhost:3010 via Docker, or 3000 locally)
npm run build    # Production build (served at /admin/)
npm run test     # Jest tests with React Testing Library
```

## Architecture

### Backend (API)

NestJS with TypeORM using an EAV (Entity-Attribute-Value) pattern:

**Modules:** `settings/`, `registry/`, `personal/`, `content/`, `feedback/`, `exception/`

**Main Entities:** `Attribute`, `Language`, `Status`, `Directory`, `Point`, `Measure`, `User`, `Group`, `Block`, `Element`, `Section`, `Form`, `Result`

**Subordinate Entities:** Named `{Parent}2{Type}` (value attributes) or `{Parent}4{Type}` (relations):
- `*2string` - string values with language support
- `*2point` - point/location references
- `*2description` - text descriptions with language
- `*2counter` - numeric counts with optional measure/point
- `*4permission` - group-based permissions
- `*4status` - status associations

**Access Control (3 levels):**
1. `@CheckId(Entity)` - Validates entity exists
2. `@CheckMethodAccess(AccessEntity.*, AccessMethod.*)` - HTTP method access
3. `@CheckIdPermission(PermissionEntity, PermissionMethod.*)` - Instance-level permissions

**Table naming:** `{module}_{entity}` (e.g., `personal_user`, `content_block`)

### Frontend (Web)

Next.js with App Router (`src/app/`):

- `src/components/` - React components with folder structure: `index.ts`, `ComponentName.tsx`, `ComponentName.module.css`, optional `svg/`
- `src/contexts/` - React context providers (`UserProvider`)
- `src/model/` - TypeScript entity interfaces (`*Entity` naming convention)
- `src/widgets/` - Reusable UI organized by category (`buttons/`, `heading/`, `input/`)
- `src/fonts/` - Font files and shared `text-styles.module.css`

**Dependencies:** Uses Swiper for carousels/sliders.

**Path alias:** `@/*` maps to `./src/*`

**SVG imports:** SVGs imported as React components via `@svgr/webpack`

**Text styles:** `import txt from '@/fonts/text-styles.module.css'` with classes `txt.heading1`, `txt.heading2`, `txt.caption`, `txt.button`, `txt.input`

### Admin Dashboard

React with Create React App, Material-UI, React Router (basename `/admin/`):

- `src/component/` - Feature components
- `src/context/` - `ApiProvider` (backend communication), `UserProvider` (auth state)
- `src/view/` - TypeScript view interfaces (`*View` naming convention)
- `src/service/` - Helper services for attribute manipulation
- `src/widget/` - Reusable widgets

## Code Patterns

**API:**
- Entity classes have blank line after opening brace and before closing brace
- Arrow functions: no brackets for single untyped parameter (`s =>` not `(s) =>`)
- Controllers use `*View` interfaces for responses, `*Input` for request bodies
- POST/PUT methods handle subordinates in a transaction via shared services

**Web:**
- Named exports: `export { Header } from './Header'`
- CSS Modules imported as `css`: `import css from './ComponentName.module.css'`
- Use `classnames` library: `import cn from 'classnames'`
- `'use client'` directive required for client components with hooks

**Admin:**
- Default exports in `index.tsx` files
- API calls via `useContext(apiContext)` with methods: `getList`, `getItem`, `postItem`, `putItem`, `deleteItem`
