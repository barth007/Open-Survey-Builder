
# Survey Application - Comprehensive Documentation

A modern, self-hosted survey creation and management platform built for teams who value data privacy and control. Now powered by a dedicated Node.js/Express backend for maximum flexibility.

## Features Showcase

<p align="center">
  <img src="screenshots/01-dashboard.png" width="800" alt="Dashboard Overview">
</p>
<p align="center">
  <img src="screenshots/02-editor.png" width="800" alt="Survey Editor">
</p>
<p align="center">
  <img src="screenshots/03-analytics.png" width="800" alt="Advanced Analytics">
</p>

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Patterns](#architecture--patterns)
4. [File Structure & Features](#file-structure--features)
5. [Authentication & Security](#authentication--security)
6. [Setup & Development](#setup--development)
7. [Testing](#testing)
8. [Backend Media & Response Sessions](#backend-media--response-sessions)
9. [API Integration](#api-integration)

## Project Overview

This survey application provides a comprehensive solution for creating, distributing, and analyzing surveys while maintaining full control over your data.

### Core Capabilities
- **Survey Creation & Management**: Drag-and-drop interface for creating complex surveys.
- **Team Collaboration**: Real-time collaboration with role-based access control.
- **Advanced Analytics**: Real-time response analysis with statistical insights.
- **Recording Features**: Screen and webcam recording for user testing.
- **API-Driven**: Now decoupled from direct BaaS calls for better scalability.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** & **shadcn/ui** for styling
- **TanStack Query** for state management
- **Zustand** for lightweight global state
- **DND Kit** for drag-and-drop

### Backend
- **Node.js & Express** providing a RESTful API
- **Prisma ORM** for database interactions
- **PostgreSQL** for persistent storage
- **JWT** for secure authentication

## Architecture & Patterns

The application has been migrated from a "BaaS-direct" model to a structured API-driven architecture.

### Data Flow
1. **Features/Pages**: High-level components that orchestrate data.
2. **Hooks**: Encapsulate logic and use Services for data fetching.
3. **Services**: Abstract the `apiFetch` calls and handle data mapping.
4. **Backend API**: Express controllers handling business logic and DB via Prisma.

### State Management
- **Server State**: Managed by TanStack Query for caching and synchronization.
- **Auth State**: Managed by a dedicated `AuthProvider` using JWT tokens.
- **UI State**: Local React hooks (`useState`, `useReducer`) or Zustand.

## File Structure & Features

The project follows a feature-based organization to improve maintainability.

### Features (`src/features/`)
- **auth/**: Login, registration, and password recovery.
- **dashboard/**: Survey listing, folder management, and overview.
- **survey-editor/**: The core editor interface, including question management and real-time preview.
- **survey-response/**: The public-facing interface for taking surveys.
- **user/**: Profile management and account settings.
- **system/**: Admin panels and system configuration.

### Shared Resources
- **src/components/**: Generic UI components (shadcn/ui, Layouts, Protection).
- **src/hooks/**: Cross-feature utility hooks.
- **src/lib/**: Core utilities like `api.ts`, `logger.ts`, and `utils.ts`.
- **src/types/**: Centralized TypeScript definitions.

## Authentication & Security

- **JWT-based Authentication**: Secure tokens used for all API requests.
- **ProtectedRoute**: Higher-order component ensuring only authorized users access private routes.
- **Role-Based Access**: Permission checks at both frontend and API levels.
- **Admin Approval**: Workflow for validating new users before granting access.

## Setup & Development

### Prerequisites
- Node.js 18+
- PostgreSQL instance

### Environment Setup
1. Create a `.env` in the root (see `.env.example`).
2. Set `DATABASE_URL` for Prisma.
3. Set `VITE_API_URL` for the frontend.

### Commands
```bash
# Install dependencies
npm install

# Install backend dependencies
npm --prefix server install

# Run dev server (Vite)
npm run dev

# Run Backend (if separate) or use launch script
./launch.sh

# Run frontend tests
npm test

# Run backend route/security tests
npm --prefix server test

# Build frontend and backend
npm run build
npm --prefix server run build
```

## Testing

The repository now has two separate test entry points:

- `npm test`
  Runs the frontend/unit test suite only. The root Vitest config excludes `server/**`.
- `npm --prefix server test`
  Runs the backend route-level security and contract suite with Supertest.

Backend coverage currently includes:
- app bootstrap/health checks
- auth approval and backdoor regression checks
- public survey access boundaries
- recording session and upload flow
- survey ownership validation
- invitation identity, expiry, and duplicate handling
- team owner invariants
- upload privacy and avatar MIME handling
- sensitive error leakage checks

## Backend Media & Response Sessions

Recording uploads no longer use public `/uploads/...` paths or client-generated UUIDs.

### Response session lifecycle
1. `POST /api/surveys/:surveyId/response-session`
   Creates a persisted draft `SurveyResponse` and returns:
   - `responseId`
   - `sessionToken`
   - `status`
2. `POST /api/surveys/recordings/upload`
   Accepts recording media only when tied to a valid draft response and authorized by:
   - the draft `sessionToken`, or
   - the authenticated participant, or
   - an authorized survey owner/admin
3. `POST /api/surveys/respond`
   Finalizes the existing draft response via:
   - `responseId`
   - `sessionToken`
   - `answers`
   - `metadata`
   - optional `participantEmail`

### Media access
- Recordings are stored privately and exposed to managers through `GET /api/surveys/recordings/:id/file`.
- The recordings list returns that authenticated API path as `recordingUrl`.
- Public generic `/uploads` serving is gone for recordings.
- Avatars are the only intentionally public uploaded asset class and are served from `/uploads/avatars/...`.

## API Integration

The application uses a centralized `apiFetch` utility in `src/lib/api.ts` that automatically handles:
- Base URL prefixing.
- JWT token injection via Interceptors.
- Error handling and logging.
- Consistent response parsing.

---

This documentation reflects the project's modern, feature-sliced architecture. For detailed implementation of specific questions or analysis logic, refer to the corresponding feature directory.
