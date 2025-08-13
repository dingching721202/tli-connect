# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# general
- Follow the user story mapping
- Strictly follow Typescript

# Next.js
- use localstorage as db
- Use less code better than more codepri 
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Development Commands

- `npm run dev` - Start development server (default port 3000)
- `npm run dev:3000` - Start development server on port 3000 with localhost hostname
- `npm run dev:8000` - Start development server on port 8000 with localhost hostname  
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15.4.2 with App Router
- **Language**: TypeScript 5.8.3 (strict mode enabled)
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives, Lucide React icons
- **State Management**: React Context (AuthContext for authentication)
- **Data Storage**: LocalStorage (acts as database)
- **Build Tool**: Next.js built-in bundler

### Core Architecture Patterns

#### Multi-Role Authentication System
- **Role-based access control** with support for multiple roles per user
- **Role types**: STUDENT, TEACHER, CORPORATE_CONTACT, AGENT, STAFF, ADMIN
- **Role locking mechanism** for single-role users to maintain consistent navigation
- **AuthContext** (`src/contexts/AuthContext.tsx`) manages all authentication state and role switching

#### Data Layer Architecture
- **LocalStorage as primary database** - all data persists in browser storage
- **Centralized data services** in `src/services/dataService.ts`
- **Data modules** in `src/data/` directory contain mock data and utilities
- **Type-safe data stores** in `src/lib/` for specific data management (member cards, orders, corporate data)

#### Page Structure (Role-Based Routing)
```
src/app/
├── [role]/              # Role-specific pages
│   ├── dashboard/       # Role-specific dashboard
│   ├── login/          # Role-specific login
│   └── [feature]/      # Role-specific features
├── api/                # API routes for data operations
├── page.tsx            # Landing page
└── layout.tsx          # Root layout with AuthProvider
```

#### Component Organization
- **Page components** handle routing and high-level logic
- **Feature components** (`src/components/`) are reusable business logic components
- **UI components** (`src/components/ui/`) are design system primitives
- **Common components** (`src/components/common/`) for shared utilities

#### Corporate Member Management
- **Unified membership system** supporting both individual and corporate memberships
- **Enterprise subscription model** with seat allocation
- **Company entity management** with subscription tracking
- See `docs/corporate-member-architecture.md` for detailed architecture

### Key Features

#### Authentication & User Management
- Multi-role user system with role switching capability
- Session persistence via localStorage
- Login source tracking for proper logout redirection
- User profile management with avatar integration

#### Membership System
- Individual and corporate membership support
- Member card plans with different durations (season/annual)
- Membership status tracking (purchased → activated → expired)
- Corporate seat allocation and management

#### Booking System
- Course and class management
- Timeslot scheduling with capacity management
- Batch booking operations
- Teacher leave management

### Data Types & Models

#### Primary Entities
- **User**: Multi-role users with campus assignment and membership status
- **Membership**: Unified model supporting individual and corporate memberships
- **Company**: Corporate entities with subscription management
- **CorporateSubscription**: Enterprise subscription with seat management
- **Course/Class/Lesson**: Educational content hierarchy
- **ClassTimeslot**: Scheduled sessions with booking capacity
- **Order**: Purchase tracking with payment integration

### Development Guidelines

#### Component Development
- Use TypeScript interfaces from `src/types/`
- Follow existing component patterns in the codebase
- Utilize Radix UI for accessible component primitives
- Apply Tailwind classes using the `cn()` utility function

#### Data Operations
- All data operations go through `dataService.ts`
- Use type-safe store classes for complex data management
- Persist state changes to localStorage immediately
- Handle role-based data filtering at the service level

#### Authentication Integration
- Use `useAuth()` hook for all authentication needs
- Check role permissions using `hasRole()`, `hasAnyRole()`, `hasAllRoles()`
- Implement role-specific navigation and feature access
- Handle role switching for multi-role users

#### API Route Development
- Follow RESTful conventions in `src/app/api/`
- Use TypeScript for request/response typing
- Implement proper error handling and status codes
- Support both individual and corporate membership operations

### File Path Conventions
- Use `@/` alias for `src/` directory imports
- Keep related functionality grouped in feature directories
- Separate types, services, and components logically
- Follow Next.js App Router conventions for routing 