# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coffee shop e-commerce website built with Next.js 16 and React 19.

## Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture

This is a Next.js App Router project using the `src/` directory structure:

- `src/app/` - App Router pages and layouts (RootLayout wraps all pages with Header, Footer, and UserProvider)
- `src/components/` - React components with standardized folder structure
- `src/contexts/` - React context providers (e.g., `UserProvider` for auth state)
- `src/model/` - TypeScript entity interfaces (e.g., `UserEntity`, `OfferEntity`, `SectionEntity`)
- `src/fonts/` - Local font files with `font.css` definitions and shared text styles
- `src/widgets/` - Reusable UI widgets organized by category (`buttons/`, `heading/`, `input/`)

## Key Configuration

- **Path alias**: `@/*` maps to `./src/*`
- **SVG imports**: SVGs are imported as React components via `@svgr/webpack` (configured for both webpack and turbopack in `next.config.ts`)
- **Fonts**: Google fonts via `next/font/google` (Playfair Display as `--font-playfair`, Inter as `--font-inter`) plus local Poppins font loaded via CSS
- **ESLint**: Uses flat config with Next.js core-web-vitals and TypeScript rules

## Component Structure

Each component follows this folder structure:
```
ComponentName/
├── index.ts              # Only exports (e.g., export { ComponentName } from './ComponentName')
├── ComponentName.tsx     # Component implementation
├── ComponentName.module.css  # Styles
└── svg/                  # Optional: SVG icons as React components
```

## Patterns

- Components use named exports: `export { Header } from './Header'`
- CSS Modules imported as `css`: `import css from './ComponentName.module.css'`
- Text styles use shared module: `import txt from '@/fonts/text-styles.module.css'` with classes like `txt.heading1`, `txt.heading2`, `txt.caption`, `txt.button`, `txt.input`
- Use `classnames` library for combining CSS classes: `import cn from 'classnames'`
- Client components requiring hooks must have `'use client'` directive
- Entity interfaces follow `*Entity` naming convention in `src/model/`
- SVG icons are stored in component `svg/` subdirectories and imported as React components
- Widgets are imported by category: `import { ButtonBig } from '@/widgets/buttons'`, `import { InputText } from '@/widgets/input'`
