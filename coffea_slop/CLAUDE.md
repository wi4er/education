# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coffee shop e-commerce platform - a monorepo with four services managed via Docker Compose.

## Quick Start

```bash
# Start all services (database, API, web)
docker compose up

# Or start individual services
docker compose up postgres    # PostgreSQL on port 5432
docker compose up api         # NestJS API on port 3020
docker compose up web         # Next.js web on port 3030

# Admin requires manual start (not in docker-compose)
cd admin && npm start         # React admin on port 3000
```

## Repository Structure

```
coffea_slop/
├── api/          # NestJS backend
├── web/          # Next.js frontend (see web/CLAUDE.md)
├── admin/        # React admin dashboard (see admin/CLAUDE.md)
├── init/         # Database initialization scripts
├── data/         # Docker volumes (postgres data, storage)
└── docker-compose.yml
```

## Services

| Service | Technology | Port | Description |
|---------|------------|------|-------------|
| postgres | PostgreSQL 16 | 5432 | Database with uuid-ossp extension |
| api | NestJS 10 + TypeORM | 3020 | REST API backend |
| web | Next.js 16 | 3030 | E-commerce frontend |
| admin | React 19 + MUI 7 | 3000 | Admin dashboard (manual start) |

## Environment Variables

Create `.env` in root with:
- `DATABASE_NAME` - PostgreSQL database name
- `DATABASE_PASSWORD` - PostgreSQL password (user is `admin`)

## Development Workflow

When working on a specific service, cd into that directory:
```bash
cd api && npm run start:dev   # API development with watch mode
cd web && npm run dev         # Web development
cd admin && npm start         # Admin development
```

Or use Docker for full stack development with hot reload (volumes are mounted for api and web).

---

## API Commands

```bash
# Development
npm run start:dev      # Run in watch mode (auto-reload on changes)
npm run start:debug    # Run with debugger attached

# Build & Production
npm run build          # Compile TypeScript to dist/
npm run start:prod     # Run compiled app from dist/

# Testing
npm run test           # Run unit tests (*.spec.ts in src/)
npm run test:watch     # Run tests in watch mode
npm run test -- --testPathPattern="attribute.controller"  # Run single test file
npm run test:e2e       # Run e2e tests (test/*.e2e-spec.ts)
npm run test:cov       # Run tests with coverage report

# Code Quality
npm run lint           # ESLint with auto-fix
npm run format         # Prettier formatting
```

## API Architecture

NestJS application with TypeORM and PostgreSQL, organized into feature modules.

**Entry Point**: `src/main.ts` - Starts on port 3000 (mapped to 3020 via Docker).

**Database**: PostgreSQL via TypeORM. Config via env vars: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`. Requires `uuid-ossp` extension.

### Module Structure

```
api/src/
├── app.module.ts       # Root module with TypeORM.forRoot()
├── common/             # Shared services, entities, inputs, access control
│   ├── access/         # Method-level access control (CheckMethodAccess guard)
│   ├── permission/     # ID-level permission control (CheckIdPermission guard)
│   ├── entities/       # Common interfaces (WithStrings, WithPoints, WithPermissions, WithDescriptions)
│   ├── inputs/         # Shared input interfaces (CommonStringInput, CommonPointInput, etc.)
│   └── services/       # Shared services (StringAttribute, PointAttribute, PermissionAttribute, DescriptionAttribute, CounterAttribute)
├── settings/           # Attribute and Language entities
├── registry/           # Directory, Point, Measure entities
├── personal/           # User and Group entities
├── content/            # Block, Element, Section entities
│   └── services/       # Module-specific services (SectionService for Element-Section relations)
└── feedback/           # Form and Result entities
```

### Table Naming Convention

All database tables are prefixed with their module name: `{module}_{entity}` (e.g., `settings_attribute`, `registry_directory`, `personal_user`).

### Controller Pattern

Controllers use typed interfaces for request/response:
- `*View` interfaces for return types (in `views/`)
- `*Input` interfaces for `@Body()` parameters (in `inputs/`)
- `toView(entity)` method to convert entity to view interface
- `@CheckId(Entity)` decorator validates entity exists before processing
- `@CheckMethodAccess(AccessEntity.*, AccessMethod.*)` decorator for access control
- `@CheckIdPermission(PermissionEntity, PermissionMethod.*)` decorator for instance-level permissions
- Tests use supertest with mocked repositories and DataSource

POST/PUT methods handle subordinate entities in a transaction:
```typescript
@Post()
@CheckMethodAccess(AccessEntity.DIRECTORY, AccessMethod.POST)
async create(@Body() data: DirectoryInput): Promise<DirectoryView> {
  const { strings, points, permissions, ...directoryData } = data;
  return this.dataSource.transaction(async manager => {
    // Create parent, then subordinates via services
    await this.stringAttributeService.create<Directory>(manager, Directory2String, saved);
    await this.pointAttributeService.create<Directory>(manager, Directory2Point, saved);
    await this.permissionAttributeService.create<Directory>(manager, Directory2Permission, saved);
  });
}
```

## Entity Pattern (EAV)

Entities follow an EAV (Entity-Attribute-Value) pattern with three types of subordinate relationships.

### Main Entities

Main entities implement `WithStrings<T>`, `WithPoints<T>`, and optionally `WithPermissions<T>` and `WithDescriptions<T>`:
- **settings**: `Attribute`, `Language`
- **registry**: `Directory`, `Point`, `Measure`
- **personal**: `User`, `Group`
- **content**: `Block`, `Element`, `Section`
- **feedback**: `Form`, `Result`

**ID Convention**: Main entities use `varchar(32)` with `uuid_generate_v4()` default. Subordinates use auto-increment.

### Subordinate Entities

Named as `{Parent}2{Type}` for value attributes or `{Parent}4{Type}` for relations:

| Type | Interface | Fields |
|------|-----------|--------|
| `*2string` | `CommonStringEntity<T>` | `parentId`, `languageId`, `attributeId`, `value` |
| `*2point` | `CommonPointEntity<T>` | `parentId`, `attributeId`, `pointId` |
| `*2description` | `CommonDescriptionEntity<T>` | `parentId`, `languageId`, `attributeId`, `value` |
| `*2counter` | `CommonCounterEntity<T>` | `parentId`, `attributeId`, `pointId?`, `measureId?`, `count` |
| `*4permission` | `CommonPermissionEntity<T>` | `parentId`, `groupId`, `method` |

All ManyToOne relations use `{ nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' }` (except nullable fields marked with `?`).

### Shared Services

Common module provides services for creating/updating subordinate entities:
- `StringAttributeService.create/update<T>(manager, EntityClass, items)`
- `PointAttributeService.create/update<T>(manager, EntityClass, items)`
- `DescriptionAttributeService.create/update<T>(manager, EntityClass, items)`
- `CounterAttributeService.create/update<T>(manager, EntityClass, items)`
- `PermissionAttributeService.create/update<T>(manager, EntityClass, items)`

## Access Control

Three-level access control system in `common/`:

1. **CheckId**: Validates that the entity with given ID exists before proceeding
2. **Method Access** (`CheckMethodAccess`): Controls access to controller methods by entity type and HTTP method
3. **ID Permission** (`CheckIdPermission`): Controls access to specific entity instances by group and permission method (READ, WRITE, DELETE, CHILD)

## Code Style

- Entity classes have blank line after opening brace and before closing brace
- Arrow function parameters: no brackets for single untyped parameter (`s =>` not `(s) =>`)
- Tests co-located with source as `*.spec.ts`

## Generating New Resources

```bash
npx nest generate module <name>
npx nest generate controller <name>
npx nest generate service <name>
```
