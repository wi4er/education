# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                    # Development server (http://localhost:3000, served at /admin/)
npm run build                # Production build (output in build/, served at /admin/)
npm run test                 # Run tests in watch mode
npm run test -- --watchAll=false  # Run tests once
npm run test -- --testPathPattern="AttributeList"  # Run single test file
```

## Architecture

React 19 admin dashboard built with Create React App, Material-UI 7, and React Router 7.

**Entry Point**: `src/index.tsx` renders `App.tsx` with routing base path `/admin/`.

### Project Structure

```
src/
├── component/     # Feature components organized by domain
│   ├── common/    # Shared layout, menu, dashboard
│   ├── content/   # Block, Element, Section (CMS content)
│   ├── feedback/  # Form, Result
│   ├── personal/  # User, Auth
│   ├── registry/  # Directory, Point
│   ├── settings/  # Attribute, Language, Status
│   ├── shared/    # Reusable edit components (StringEdit, PointEdit, etc.)
│   └── storage/   # Collection, File
├── context/       # React context providers (ApiProvider, UserProvider)
├── service/       # Helper functions for column generation and value extraction
├── App.tsx        # Main app with routing and provider hierarchy
└── index.tsx      # Entry point
```

### Context Providers

Provider hierarchy in `App.tsx`: `ApiProvider` → `UserProvider` → `BrowserRouter`

**ApiProvider** (`context/ApiProvider/`):
- `ApiEntity` enum - Type-safe endpoint identifiers
- `Pagination` interface - `{ limit?: number; offset?: number }`
- `ListResponse<T>` interface - `{ data: T[]; count: number }`
- `ApiData` interface: `getList<T>`, `getItem<T>`, `postItem<T>`, `putItem<T>`, `deleteItem`
- All API calls go to `/api/*` endpoints (configurable via `API_PATH` env var)

**UserProvider** (`context/UserProvider/`): Auth state with `useUser`, `useLogIn`, `useLogOut`

### Routing

Routes defined in `App.tsx` with `basename="/admin/"`:
- `/` → Dashboard
- `/users`, `/attributes`, `/languages`, `/statuses` → List views
- `/blocks`, `/directories`, `/forms`, `/collections` → List views with detail routes (`/:id`)

### Component Domains

Each domain folder contains: `*List` (table view), `*Form` (create/edit dialog), `*Detail` (parent with child lists), and `view/` with TypeScript interfaces.

## Patterns

- Named exports from `index.ts` files: `export { ComponentName } from './ComponentName'`
- API calls via `useContext(apiContext)`: `getList<T>(ApiEntity.DIRECTORY, pagination).then(({ data, count }) => ...)`
- View interfaces in `component/*/view/` follow `*View` naming
- List components: fetch in `useEffect`, store `list` and `count` in state, use `TablePagination` with server-side pagination
- Form components: controlled inputs with `useState`, submit via `postItem`/`putItem`
- Shared edit components export helper functions (e.g., `stringsToGrouped`, `groupedToStrings`)

## Code Style

- Arrow function parameters: no brackets for single untyped parameter (`s =>` not `(s) =>`)
- Material-UI imports: `@mui/material`, `@mui/icons-material`
- Import destructuring without spaces: `import {useState} from 'react'`
