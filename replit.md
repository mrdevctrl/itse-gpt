# AI Chat Assistant

## Overview

This is a modern full-stack AI chat application built with React, Express, and TypeScript. The application provides a conversational interface where users can interact with AI assistants through a clean, responsive web interface. It features conversation management, customizable AI settings, and a modern UI built with shadcn/ui components.

The system follows a monorepo structure with shared TypeScript schemas between frontend and backend, ensuring type safety across the entire application stack.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development/build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming support (light/dark modes)
- **Form Handling**: React Hook Form with Zod validation
- **Code Structure**: Feature-based organization with custom hooks for business logic

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **API Design**: RESTful API with JSON responses
- **Database Layer**: Drizzle ORM with PostgreSQL dialect
- **Data Storage**: Dual implementation with in-memory storage (MemStorage) and database-ready structure
- **Schema Validation**: Zod schemas shared between frontend and backend
- **Error Handling**: Centralized error handling with structured API responses

### Database Design
- **ORM**: Drizzle ORM with type-safe database operations
- **Schema**: Two main entities:
  - **Conversations**: Stores chat sessions with AI configuration (temperature, model, system prompt, max tokens)
  - **Messages**: Stores individual messages within conversations with role-based typing (user/assistant/system)
- **Relationships**: One-to-many relationship between conversations and messages with cascade delete
- **Migration**: Drizzle Kit for schema migrations and database management

### Development & Build Tools
- **Build System**: Vite for frontend bundling, esbuild for backend bundling
- **Type Safety**: Shared TypeScript configuration across client, server, and shared modules
- **Development**: Hot module replacement for frontend, tsx for backend development server
- **Code Quality**: TypeScript strict mode, path aliases for clean imports
- **Testing**: Test-ready structure with data-testid attributes throughout components

### Key Design Patterns
- **Type-Safe API**: Shared Zod schemas ensure consistent data validation between frontend and backend
- **Component Architecture**: Presentational and container component separation with custom hooks
- **Error Boundaries**: Structured error handling with user-friendly error states
- **Responsive Design**: Mobile-first approach with collapsible sidebar and adaptive layouts
- **Theme System**: CSS custom properties based theming with system/light/dark mode support

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection (Neon serverless)
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **express**: Web application framework for Node.js
- **react**: Frontend UI library
- **vite**: Frontend build tool and development server

### UI Component Libraries
- **@radix-ui/***: Unstyled, accessible UI primitives for complex components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class composition
- **lucide-react**: Modern icon library

### Development and Build Tools
- **typescript**: Static type checking
- **tsx**: TypeScript execution engine for development
- **esbuild**: Fast JavaScript bundler for production builds
- **drizzle-kit**: Database migration and introspection tools

### Utility Libraries
- **zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation and formatting
- **wouter**: Lightweight React router
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **clsx**: Conditional CSS class composition utility