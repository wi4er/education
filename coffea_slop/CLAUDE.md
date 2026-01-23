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
- API: `http://localhost/api/*` → proxies to `api:3000/*` (strips `/api` prefix)

**Direct service ports (bypass nginx):**
- PostgreSQL: `localhost:5432`
- API: `localhost:3020` (container runs on 3000, mapped to 3020)
- Web: `localhost:3030`
- Admin: `localhost:3010`

**Environment:** Create `.env` in project root:
```
DATABASE_NAME=coffea
DATABASE_PASSWORD=your_password
JWT_SECRET=your_secret
ADMIN_GROUP=admin
```

**First-time setup:** The `init/init.sql` script automatically creates the `uuid-ossp` PostgreSQL extension when the database container starts. PostgreSQL data persists in `data/postgres/`, file storage in `data/storage/`, uploads in `data/upload/`. Admin user/group must be created manually via the API after first startup.

## Commands by App

Commands can run inside Docker containers or locally. Docker containers auto-start in watch mode.

**Running commands in containers:**
```bash
docker compose exec api npm run test                 # Run API tests inside container
docker compose exec api npm run lint                 # Run API lint inside container
docker compose logs api -f                           # Follow API container logs
docker compose exec postgres psql -U admin -d coffea # Connect to PostgreSQL
```

### API (`cd api`)
```bash
npm run start:dev                                    # Watch mode
npm run test                                         # Unit tests
npm run test -- --testPathPattern="<pattern>"        # Single test file
npm run test:e2e                                     # E2E tests
npm run lint                                         # ESLint with auto-fix
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
npm run test     # Jest tests in watch mode
npm run test -- --watchAll=false                     # Run tests once
npm run test -- --testPathPattern="<pattern>"        # Single test file
```

## Architecture

### Backend (API)

NestJS with TypeORM using an EAV (Entity-Attribute-Value) pattern:

**Modules:** `settings/`, `registry/`, `personal/`, `content/`, `feedback/`, `storage/`, `common/` (shared services), `exception/` (error handling)

**Main Entities:**
- **settings**: `Attribute`, `Language`, `Status` - base configuration
- **registry**: `Directory`, `Point`, `Measure` - hierarchical catalogs
- **personal**: `User`, `Group`, `Access` - auth and permissions
- **content**: `Block`, `Element`, `Section` - CMS content
- **feedback**: `Form`, `Result` - user feedback forms
- **storage**: `Collection`, `File` - file storage with parent-child permission inheritance

**Subordinate Entities:** Named `{Parent}2{Type}` (value attributes) or `{Parent}4{Type}` (relations):
- `*2string` - string values with language support
- `*2point` - point/location references
- `*2description` - text descriptions with language
- `*2counter` - numeric counts with optional measure/point
- `*2file` - file references with attributeId
- `*4image` - direct file references (no attributeId)
- `*4permission` - group-based permissions
- `*4status` - status associations

**Access Control (5 levels):**
1. `@CheckId(Entity)` - Validates entity exists
2. `@CheckMethodAccess(AccessEntity.*, AccessMethod.*)` - HTTP method access
3. `@CheckIdPermission(PermissionEntity, PermissionMethod.*)` - Instance-level permissions
4. `@CheckParentPermission` - For child entities, checks parent's permissions
5. `@CheckInputPermission` - Validates permission on entity referenced in request body

**Table naming:** `{module}_{entity}` (e.g., `personal_user`, `content_block`)

### Frontend (Web)

Next.js 16 with App Router (`src/app/`) and React 19:

- `src/components/` - React components with folder structure: `index.ts`, `ComponentName.tsx`, `ComponentName.module.css`, optional `svg/`
- `src/contexts/` - React context providers (`UserProvider`)
- `src/model/` - TypeScript entity interfaces (`*Entity` naming convention)
- `src/widgets/` - Reusable UI organized by category (`buttons/`, `heading/`, `input/`)
- `src/fonts/` - Font files and shared `text-styles.module.css`

**Dependencies:** Uses Swiper for carousels/sliders (`import { Swiper, SwiperSlide } from 'swiper/react'`), classnames for combining CSS classes.

**Path alias:** `@/*` maps to `./src/*`

**SVG imports:** SVGs imported as React components via `@svgr/webpack`

**Text styles:** `import txt from '@/fonts/text-styles.module.css'` with classes `txt.heading1`, `txt.heading2`, `txt.caption`, `txt.button`, `txt.input`

### Admin Dashboard

React with Create React App, Material-UI, React Router (basename `/admin/`):

- `src/component/` - Feature components organized by domain (`common/`, `content/`, `feedback/`, `personal/`, `registry/`, `settings/`, `shared/`)
- `src/context/` - `ApiProvider` (modular hooks: `useGet`, `useGetItem`, `usePost`, `usePut`, `useDelete`; combined as `useApi`), `UserProvider` (auth state with `useUser`, `useLogIn`, `useLogOut`)
- `src/view/` - TypeScript view interfaces (`*View` naming convention)
- `src/service/` - Helper services for dynamic column generation and value extraction (`getStringColumns`, `getPointColumns`, `getDescriptionColumns`, `getStatusColumns`, `getStringValue`, `getPointValue`)
- `src/widget/` - Reusable widgets

## Code Patterns

**API:**
- Entity classes and interfaces have blank line after opening brace and before closing brace
- `extends` and `implements` clauses on new line with 2-space indent:
  ```typescript
  export class Directory
    extends BaseEntity
    implements WithStrings<Directory> {
  ```
- Import destructuring without spaces: `import {Repository, DataSource} from 'typeorm'`
- Arrow functions: no brackets for single untyped parameter (`s =>` not `(s) =>`)
- `@ManyToOne`/`@OneToMany` decorators with each argument on new line
- Controllers use `*View` interfaces for responses, `*Input` for request bodies
- POST/PUT methods handle subordinates in a transaction via shared services
- Tests co-located with source as `*.spec.ts`, use `test-db.module.ts` for mocked DataSource

**Web:**
- Named exports: `export { Header } from './Header'`
- CSS Modules imported as `css`: `import css from './ComponentName.module.css'`
- Use `classnames` library: `import cn from 'classnames'`
- `'use client'` directive required for client components with hooks

**Admin:**
- Named exports with barrel files: `index.ts` exports from `ComponentName.tsx`
- API calls via `useContext(apiContext)` with methods: `getList`, `getItem`, `postItem`, `putItem`, `deleteItem`
- Material-UI components from `@mui/material` and `@mui/icons-material`
- Form components use controlled inputs; List components follow fetch-in-useEffect pattern
