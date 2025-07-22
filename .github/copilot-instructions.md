# TillerQuest AI Development Guide

## 🎯 Project Overview

TillerQuest is a classroom gamification platform inspired by Heimdallsquest, built as a full-stack TypeScript application with Next.js frontend and Express backend. Players engage in a 360-day RPG-style experience with classes, abilities, guilds, and cooperative gameplay.

## 🏗️ Architecture & Data Flow

### Dual-Database Setup

- **Frontend**: Next.js with Prisma client for read-heavy operations
- **Backend**: Express API with Prisma client for write operations and game logic
- **Database**: PostgreSQL with shared schema across both applications

### Key Patterns

- **Server Actions**: Frontend uses `"use server"` for database operations (e.g., `useAbility.ts`)
- **Validation**: Zod schemas for data validation across both frontend/backend
- **Authentication**: Better-Auth with GitHub OAuth, dual setup in both apps
- **Rate Limiting**: Express rate-limiting on backend API routes

## 🎮 Game System Architecture

### Core Game Loop

1. **Daily Mana**: 1-5 mana/day (Wizards get +2 bonus)
2. **Ability Usage**: Players spend mana/health to cast abilities
3. **Experience**: Gain XP from abilities, level up weekly
4. **Gemstones**: 2 per level, used to unlock abilities in skill trees
5. **Gold**: Earned through gameplay, used for purchasing items and voting

### Ability System (Critical Balance Rules)

- **Gemstone Costs**: Only 1, 2, or 4 gemstones (never 3, 5, 6+)
- **Mana Costs**: 2-3 (basic), 3-4 (intermediate), 4-6 (advanced), 10-15 (ultimate)
- **Health Costs**: 3 HP (7.5%), 5 HP (12.5%), 8 HP (20% - discouraged)
- **XP Rewards**: 25, 50, 100, 200, 400, 600 (null for passives)
- **Duration Abilities**: Get XP bonuses and mana reductions for longer durations

## 🔧 Development Workflow

### Database Management

```bash
# Backend database operations
cd backend/
npm run generate    # Seed database with mock data
npm run reset       # Reset database (development only)
npx prisma studio   # Database GUI

# Frontend operations
cd frontend/
npm run postinstall # Generate Prisma client
```

### Docker Development

- PostgreSQL via Docker Compose in `backend/db/docker/`
- Environment variables required in `.env` files

### Project Structure Conventions

- **Components**: Keep close to usage in `_components` folders
- **Data Layer**: Frontend `/data/` organized by feature (abilities, users, etc.)
- **Server Actions**: All database writes use `"use server"` directive
- **Types**: Interfaces preferred, shared types in closest common folder

## 🛡️ Security & Auth Patterns

### Authentication Flow

- **Client-side**: `useAuth()` hook for client components
- **Server-side**: `auth.api.getSession()` for server components and API routes
- **Middleware**: Edge-compatible session check, redirects to `/signup`
- **Authorization**: Functions like `check...` for role-based access control in the backend, and functions like `require...` for frontend route protection
- **OWASP Compliance**: Follow OWASP Top 10 guidelines for secure coding practices. ALWAYS.

### Route Protection

- **Public Routes**: Defined in `routes.ts`
- **Protected Routes**: Everything else requires session
- **Admin Routes**: Role-based access control

## 🎨 UI/UX Conventions

### Design System

- **Dark Mode Only**: Black background (#0f172a), white text
- **Primary Colors**: Purple variants (`purple-900`, `purple-800`, `purple-500`)
- **Responsive**: xl (Desktop), lg (Laptop), md (Tablet), sm (Phone)
- **Material UI**: Base component library with custom theming

### Component Patterns

- **SSR Preferred**: Keep server-side rendering where possible
- **Client Components**: Only when needed for interactivity
- **Pascal Case**: All component names use PascalCase

## 📊 Data Layer Patterns

### Prisma Usage

- **Transaction Wrapper**: `PrismaTransaction` type for complex operations
- **Validation**: Server-side validation with Zod before database operations
- **Logging**: Winston logger for all database operations and errors

### Game State Management

- **Passive Effects**: Calculated server-side, applied to user actions
- **Ability Costs**: Validated against user resources before execution
- **Experience/Leveling**: Automated calculation with level-up rewards

## 🔍 Key Files to Reference

- **Balance Rules**: `.github/instructions/balance.instructions.md`
- **Database Schema**: `prisma/schema.prisma` (shared across frontend/backend)
- **Auth Config**: `auth.ts` (both apps)
- **Ability Game Logic**: `frontend/data/abilities/abilityUsage/useAbility.ts`
- **Seeding**: `backend/db/generate.js` and related seed files

## ⚠️ Critical Don'ts

- Never break gemstone cost tiers (1-2-4 only)
- Don't create abilities without team cooperation benefits
- Avoid light mode designs (dark mode only)
- Don't use database queries in middleware (edge runtime)
- Never bypass authentication in protected routes
- Never write insecure code that could lead to OWASP vulnerabilities
- Avoid hardcoding sensitive information (use environment variables)
