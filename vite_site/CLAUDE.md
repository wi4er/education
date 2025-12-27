# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

All commands should be run from the `site/` directory:

```bash
npm run dev      # Start development server
npm run build    # TypeScript check + production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Tech Stack

- **Framework**: React 19 + TypeScript (strict mode)
- **Build**: Vite with Rolldown (`rolldown-vite`)
- **Routing**: TanStack Router with file-based convention
- **Animation**: GSAP with `@gsap/react` hooks
- **Styling**: CSS Modules with native CSS nesting

## Architecture

### Source Structure (`site/src/`)

```
src/
├── pages/           # Route pages (*.page.tsx)
├── components/      # Feature components (EventBar, MainTitle, SectionGrid)
├── layout/          # Layout components (CommonLayout, HeaderBar, FooterBar)
├── animation/       # Reusable animation components (SwapText)
├── fonts/           # Font files and typography system
├── router.tsx       # Route tree configuration
└── main.tsx         # App entry point
```

### Routing Pattern

Routes use TanStack Router with explicit route tree in `router.tsx`:
- Pages are `*.page.tsx` files that export route objects
- Root layout is `CommonLayout` (wraps Header + Main + Footer)
- Auto code-splitting is enabled via the router plugin

### Styling Conventions

- **CSS Modules**: Every component has a co-located `*.module.css` file
- **CSS Nesting**: Use native `@media` inside selectors for responsive styles
- **Typography**: Import styles from `src/fonts/text-style.module.css` (heading_1-6, paragraph_1, caption)
- **Breakpoints**: 800px (tablet), 1280px (desktop)
- **Conditional classes**: Use `classnames` package for combining CSS module classes

### Animation Patterns

GSAP animations use the `useGSAP` hook from `@gsap/react`:
- Pass a container ref as `scope` for scoped element selection
- Use `gsap.context()` for cleanup
- ScrollTrigger for scroll-based animations
- Timeline API for sequenced animations

### SVG Imports

SVGs can be imported as React components via `vite-plugin-svgr`:
```tsx
import Logo from './logo.svg?react';
```

## Fonts

Custom fonts in `src/fonts/`:
- **Rubik**: Primary font (weights 300-900)
- **Rubik Bubbles**: Decorative display font
- **Fragment Mono**: Monospace for captions
