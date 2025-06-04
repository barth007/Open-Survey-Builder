# Codex Agent Instructions

This repository contains a React + Vite + TypeScript survey application. The following instructions apply to all files.

## Development
- Install dependencies with `npm install` (requires Node.js 18+).
- Run the development server with `npm run dev`.
- Build the production bundle with `npm run build`.

## Code Quality
- Lint the project using `npm run lint` before committing any changes.

## Repository Structure
- **src/components** – Shared UI components such as survey editors and form inputs.
- **src/hooks** – Reusable React hooks (e.g. `useSurveyData`, `useIsMobile`) for state and side effects.
- **src/services** – API wrappers and Supabase calls.
- **src/pages** – Route-level components for application views.
- **src/contexts** / **src/providers** – React context definitions and their providers.
- **src/utils** – Utility functions used across the app.

## Dependencies
- **React 18** with **TypeScript** as the primary framework.
- **Tailwind CSS** and **shadcn/ui** for styling.
- **Supabase** for authentication and storage.
- **TanStack Query** for server state management.
- Radix UI components and other libraries listed in `package.json`.

## Workflow
- Use **Node.js 18+**.
- Install dependencies with `npm install`.
- Create `.env.local` from `.env.example` before starting development.
- Create or update files in the `src` directory following the structure above.
- Use hooks from `src/hooks` to share logic between components.
- Run `npm run dev` to start the development server.
- Run `npm run lint` and `npm run build` before committing any changes.

## Pull Requests
- Summaries should mention the files modified and the purpose of the change.
- After making modifications, run `npm run lint` and `npm run build` to verify the project compiles.
- If these commands fail due to missing dependencies or network restrictions, note the failure in the PR description.
