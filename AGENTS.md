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

Components typically rely on hooks from `src/hooks` for local and server state and call functions from `src/services` to fetch or persist data. This keeps UI logic focused on rendering while data access lives in a dedicated layer.

Pages compose multiple components to build each route. They orchestrate data loading by invoking services and passing results down to their children.

Contexts and their providers hold shared application state. Components access this state through the corresponding context hooks so it can be reused across pages and components.

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

## Agents

### Analysis Agent
- `src/components/survey/analysis/AnalysisPanel.tsx` manages tabs and renders statistics, scaling and outlier views.
- `src/components/survey/analysis/StatisticalInsights.tsx` computes metrics like mode and distribution trends.
- `src/components/survey/analysis/ResponsesProcessor.ts` normalizes survey answers for charting and filtering.
- `src/components/survey/analysis/useAnswersTab.ts` ties together fetching responses and user interactions in the analysis tab.

These files coordinate to process responses and present insights within the survey analysis UI.

### Index Agent
- `src/pages/Index.tsx` drives the main survey editor, handling title and question updates while showing a live preview.
- `src/hooks/useSurveyState.ts` manages client-side survey state and autosaving behavior.
- `src/components/survey/SurveySidebar.tsx` and `SurveyNavigationHeader.tsx` provide navigation around the editing experience.

### Login Agent
- `src/pages/Login.tsx` handles user authentication with Supabase and Google OAuth.
- `src/components/auth/EmailAuthForm.tsx` manages email sign in and sign up forms.
- `src/providers/auth/AuthProvider.tsx` supplies authentication context used across the app.

### Dashboard Agent
- `src/pages/Dashboard.tsx` lists surveys and folders for the current user.
- `src/hooks/useSurveyData.ts` fetches surveys and organizes them for display.
- `src/components/dashboard/SurveyCard.tsx` and `FolderCard.tsx` render survey and folder summaries.

### Profile Agent
- `src/pages/Profile.tsx` renders personal info, team management and settings tabs.
- `src/hooks/useProfile.ts` loads and updates profile records.
- `src/components/profile` contains `PersonalInfoTab.tsx`, `TeamTab.tsx` and `AccountSettingsTab.tsx` used within the page.

### Teams Agent
- `src/hooks/useTeams.ts` exposes team queries and mutations.
- `src/hooks/team/useTeamTabLogic.ts` coordinates dialogs and team actions within the profile page.
- `src/components/profile/team` holds UI pieces like `TeamList.tsx`, `InvitationDialog.tsx` and other team management components.

### Public Survey Agent
- `src/pages/PublicSurvey.tsx` shows a shareable survey that records responses.
- `src/hooks/survey/useSurveyResponseLogic.ts` tracks answers and handles submission.
- `src/components/survey/response/QuestionItem.tsx` renders individual questions during public participation.

### Survey Response Agent
- `src/pages/SurveyResponse.tsx` allows viewing and completing a private survey link.
- Relies on the same response logic and question components as the public survey flow.

### Admin Agent
- `src/pages/AdminPanel.tsx` is used by administrators to approve or reject access requests.
- Uses Supabase queries and mutations to manage profile status and roles.
