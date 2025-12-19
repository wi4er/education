# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                    # Development server (http://localhost:3000, served at /admin/)
npm run build                # Production build (output in build/, served at /admin/)
npm run test                 # Run tests in watch mode
npm run test -- --watchAll=false  # Run tests once
```

## Architecture

React admin dashboard built with Create React App, Material-UI, and React Router.

**Entry Point**: `src/index.tsx` renders `App.tsx` with routing base path `/admin/`.

### Project Structure

```
src/
├── component/     # Feature components with folder structure (ComponentName/index.tsx)
├── context/       # React context providers with modular hooks
├── model/         # TypeScript view interfaces (*View naming)
├── widget/        # Reusable UI components
├── App.tsx        # Main app with routing and provider hierarchy
└── index.tsx      # Entry point
```

### Context Providers

Provider hierarchy in `App.tsx`: `ApiProvider` → `UserProvider` → `BrowserRouter`

**ApiProvider** (`context/ApiProvider/`): Modular structure with separate hooks:
- `useGet`, `useGetItem`, `usePost`, `usePut`, `useDelete` - Individual API operation hooks
- `useApi` - Combines all hooks
- `ApiData` interface: `getList<T>`, `getItem<T>`, `postItem<T>`, `putItem<T>`, `deleteItem`
- All API calls go to `/api/*` endpoints

**UserProvider** (`context/UserProvider/`): Auth state management:
- `useUser` - Current user state
- `useLogIn`, `useLogOut` - Auth operations
- `UserData` interface with `SignInEntity`

### Routing

Routes defined in `App.tsx` with `basename="/admin/"`:
- `/` → Dashboard
- `/users` → UserList
- `/attributes` → AttributeList

## Patterns

- Named exports from `index.tsx` files: `export { ComponentName } from './ComponentName'`
- Context providers export both the provider component and the context object
- API calls via `useContext(apiContext)` with typed generic methods
- View interfaces in `model/` follow `*View` naming (e.g., `AttributeView`, `StringsByAttr`)
- Form components use controlled inputs with `useState` for each field
- List components follow pattern: fetch data in `useEffect`, store in state, render with Material-UI Table
- Reusable editing components (like `StringEdit`) export both the component and helper functions (`stringsToGrouped`, `groupedToStrings`)

## Component Conventions

- Material-UI components: `@mui/material`, `@mui/icons-material`
- Forms use Material-UI `Dialog`, `TextField`, `Select`, `FormControl`
- Tables use Material-UI `Table`, `TableContainer`, `TablePagination`
- Error handling via `Snackbar` component
- Arrow function parameters: no brackets for single parameter (`s =>` not `(s) =>`)
