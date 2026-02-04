# QueueCut - Barbershop Queue Management System

## Overview

QueueCut is a full-stack web application for managing barbershop appointments and queues. It provides a customer-facing booking interface, a barber dashboard for queue management, and multi-tenant support for shop organizations. The system handles real-time slot management, booking confirmations via SMS/WhatsApp (Twilio), and analytics for barbers and shop managers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, custom stores (booking-store, barber-store, analytics-store) for client state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom dark industrial theme (gold/brass accents)
- **Animations**: Framer Motion for transitions and micro-interactions
- **Charts**: Recharts for analytics visualizations
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Style**: RESTful JSON API under `/api/*` routes
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with connect-pg-simple for PostgreSQL session storage
- **Authentication**: bcryptjs for password hashing, session-based auth for barbers

### Data Storage
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **Schema Location**: `shared/schema.ts` using Drizzle table definitions
- **Migrations**: Drizzle Kit for schema migrations (`drizzle-kit push`)
- **Tables**: shops, barbers, bookings, slots

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared code (`shared/`) in one repository
- **Shared Types**: Schema definitions in `shared/schema.ts` generate both database types and Zod validation schemas via `drizzle-zod`
- **Path Aliases**: `@/*` maps to client source, `@shared/*` maps to shared code
- **Storage Abstraction**: `server/storage.ts` provides an interface layer over database operations

### Build & Development
- Development runs Vite dev server with HMR proxied through Express
- Production build bundles client with Vite, server with esbuild
- Server dependencies are selectively bundled to reduce cold start times

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database operations and schema management

### Third-Party Services
- **Twilio**: SMS and WhatsApp notifications for booking confirmations and status updates
  - Connected via Replit Connectors API
  - Credentials fetched dynamically from connector settings

### UI Libraries
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-built component collection using Radix + Tailwind
- **Lucide React**: Icon library

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animations
- `recharts`: Charts and data visualization
- `zod`: Runtime validation
- `wouter`: Client-side routing
- `date-fns`: Date manipulation