
# Survey Application - Agent Instructions

This repository contains a React + Vite + TypeScript survey creation and management platform. The following instructions apply to all files and provide detailed information about the codebase structure.

## Development Setup
- Install dependencies with `npm install` (requires Node.js 18+)
- Create `.env.local` from `.env.example` with Supabase credentials
- Run development server with `npm run dev` or use `./launch.sh`
- Build production bundle with `npm run build`
- Lint the project using `npm run lint` before committing changes

## Repository Structure

### Core Application Files
- **src/App.tsx** – Main application component with routing configuration
- **src/main.tsx** – Application entry point with React root mounting
- **src/index.css** – Global styles and Tailwind CSS imports

### Pages (`src/pages/`)
- **Dashboard.tsx** – Main dashboard showing surveys and folders
- **Index.tsx** – Survey editor with dual-pane layout (edit/preview)
- **Login.tsx** – Authentication page with Google OAuth
- **Profile.tsx** – User profile management with team settings
- **PublicSurvey.tsx** – Public survey participation interface
- **SurveyResponse.tsx** – Private survey response interface
- **AdminPanel.tsx** – Admin interface for user approval
- **Landing.tsx** – Landing page for unauthenticated users
- **NotFound.tsx** – 404 error page

### Core Components (`src/components/`)

#### UI Components (`src/components/ui/`)
- **SurveyLayout.tsx** – Main layout wrapper for survey editing interface
- **resizable.tsx** – Resizable panel components for split layouts
- **alert-dialog.tsx** – Modal dialog components
- **button.tsx, input.tsx, card.tsx** – Basic UI building blocks
- **sidebar.tsx** – Collapsible sidebar component system
- **toast.tsx, sonner.tsx** – Notification components

#### Survey Management (`src/components/survey/`)
- **SurveyNavigationHeader.tsx** – Top navigation with save status and publish toggle
- **SurveySidebar.tsx** – Left sidebar with survey navigation
- **SurveyTabs.tsx** – Tab switcher between edit and answers views
- **PreviewTab.tsx** – Live preview of survey questions
- **ShareSurveyButton.tsx** – Survey sharing and public link management

#### Survey Editing (`src/components/survey/edit/`)
- **WelcomeCard.tsx** – Welcome page configuration
- **QuestionSection.tsx** – Main question editing interface
- **ThankYouCard.tsx** – Thank you page configuration

#### Survey Response (`src/components/survey/response/`)
- **QuestionItem.tsx** – Individual question renderer for responses
- **QuestionRenderer.tsx** – Main question rendering logic
- **MultipleChoiceRenderer.tsx** – Multiple choice question type
- **CheckboxesRenderer.tsx** – Checkbox question type
- **LikertScaleRenderer.tsx** – Likert scale question type
- **TextQuestionRenderer.tsx** – Text input question type
- **QuestionMedia.tsx** – Media display for questions

#### Analysis (`src/components/survey/analysis/`)
- **AnalysisPanel.tsx** – Right panel for response analysis
- **StatisticalInsights.tsx** – Statistical metrics and calculations
- **ResponsesProcessor.ts** – Data processing and filtering utilities
- **ResponsesList.tsx** – List of response summaries
- **SummaryCard.tsx** – Response count and export controls
- **FilterControls.tsx** – Response filtering interface
- **NoResponsesView.tsx** – Empty state for no responses
- **DeleteResponsesDialog.tsx** – Response deletion interface

#### Question Management
- **QuestionCard.tsx** – Individual question editor
- **QuestionTypeMenu.tsx** – Question type selection
- **AddQuestionButton.tsx** – Add new question interface
- **QuestionMediaUpload.tsx** – Media upload for questions

#### Authentication (`src/components/auth/`)
- **EmailAuthForm.tsx** – Email/password authentication form

#### Dashboard (`src/components/dashboard/`)
- **SurveyCard.tsx** – Survey summary display
- **FolderCard.tsx** – Folder summary display

#### Profile Management (`src/components/profile/`)
- **PersonalInfoTab.tsx** – Personal information editing
- **TeamTab.tsx** – Team management interface
- **AccountSettingsTab.tsx** – Account settings

#### Team Management (`src/components/profile/team/`)
- **TeamList.tsx** – List of user's teams
- **TeamMembersList.tsx** – Team member management
- **InvitationDialog.tsx** – Team invitation interface
- **TeamCreationDialog.tsx** – New team creation

### Hooks (`src/hooks/`)

#### Survey Hooks (`src/hooks/survey/`)
- **useSurveyState.ts** – Main survey state management with auto-save
- **useMutateSurvey.ts** – Survey CRUD operations
- **useQuerySurvey.ts** – Single survey data fetching
- **useQuerySurveys.ts** – Multiple surveys data fetching
- **useQuerySurveyResponses.ts** – Survey responses data fetching
- **useSubmitResponse.ts** – Survey response submission
- **useSurveyResponseLogic.ts** – Survey completion logic
- **useDeleteResponses.ts** – Response deletion operations
- **useQuestionManagement.ts** – Question CRUD operations
- **useSmartAutoSave.ts** – Intelligent auto-saving logic

#### Question Hooks (`src/hooks/question/`)
- **useQuestionBasics.ts** – Basic question properties
- **useQuestionOptions.ts** – Question options management
- **useQuestionMedia.ts** – Media handling for questions
- **useConditionalLogic.ts** – Question conditional logic
- **useLikertOptions.ts** – Likert scale configuration

#### Team Hooks (`src/hooks/team/`)
- **useTeams.ts** – Team data management
- **useTeamManagement.ts** – Team CRUD operations
- **useTeamInvitation.ts** – Team invitation handling
- **useTeamQueries.ts** – Team data fetching

#### Utility Hooks
- **useSurveyData.ts** – Survey data aggregation
- **useProfile.ts** – User profile management
- **useActiveUsers.ts** – Real-time user activity
- **useDebounce.ts** – Input debouncing utility
- **use-mobile.tsx** – Mobile detection
- **use-toast.tsx** – Toast notification management

### Services (`src/services/`)
- **teamService.ts** – Team-related API calls
- **team/teamAuthService.ts** – Team authentication
- **team/teamCreationService.ts** – Team creation logic
- **team/teamInvitationService.ts** – Team invitation management

### Providers (`src/providers/`)
- **AuthProvider.tsx** – Legacy authentication provider
- **auth/AuthProvider.tsx** – Main authentication context
- **auth/authService.ts** – Authentication service layer
- **auth/useAuthState.ts** – Authentication state management

### Types (`src/types/`)
- **survey.ts** – Survey and question type definitions
- **survey-organization.ts** – Organization and team types
- **team-types.ts** – Team-specific type definitions
- **database.ts** – Supabase database types

### Utilities (`src/utils/`)
- **type-mappers.ts** – Data transformation utilities
- **participantUtils.ts** – Participant data handling
- **popupBlocker.ts** – Popup blocking utilities

### Integration (`src/integrations/`)
- **supabase/client.ts** – Supabase client configuration
- **supabase/types.ts** – Supabase type definitions

## Dependencies & Tech Stack
- **React 18** with **TypeScript** as the primary framework
- **Tailwind CSS** and **shadcn/ui** for styling and components
- **Supabase** for authentication, database, and real-time features
- **TanStack Query** for server state management and caching
- **React Router** for client-side routing
- **Recharts** for data visualization and analytics
- **Lucide React** for icons
- **DND Kit** for drag-and-drop functionality
- **React Hook Form** with **Zod** for form validation

## Architecture Patterns

### State Management
- **Server State**: TanStack Query for API data caching and synchronization
- **Local State**: React useState and useReducer for component state
- **Global State**: React Context for authentication and team data
- **Form State**: React Hook Form for complex forms with validation

### Data Flow
1. **Pages** orchestrate data fetching and pass data to child components
2. **Hooks** encapsulate business logic and API interactions
3. **Services** handle direct API calls and data transformation
4. **Components** focus on rendering and user interactions

### Auto-saving Strategy
- **Smart debouncing** prevents excessive API calls during typing
- **Optimistic updates** provide immediate feedback
- **Error recovery** with automatic retry logic
- **Conflict resolution** for concurrent editing

## Key Features

### Survey Builder
- **Drag-and-drop** question reordering
- **Multiple question types**: text, multiple choice, checkboxes, Likert scales
- **Conditional logic** for dynamic survey flow
- **Media support** for images, videos, and Figma prototypes
- **Real-time preview** with dual-pane editing

### Team Collaboration
- **Multi-tenant architecture** with team workspaces
- **Role-based permissions** (owner, admin, member)
- **Real-time collaboration** indicators
- **Invitation system** with email notifications

### Analytics & Insights
- **Real-time response tracking**
- **Statistical analysis** with charts and graphs
- **Data filtering and export** (CSV format)
- **Response management** with soft/hard deletion

### Security & Privacy
- **Row-level security** policies in Supabase
- **Authentication** via Google OAuth and email/password
- **Data ownership** controls
- **Audit logging** for administrative actions

## Development Workflow
1. **Create feature branches** for new functionality
2. **Use hooks** to share logic between components
3. **Create small, focused components** (prefer composition over large files)
4. **Follow TypeScript strict mode** requirements
5. **Test responsive design** across device sizes
6. **Validate with ESLint** before committing
7. **Build verification** before deployment

## Agent Responsibilities

### Survey Builder Agent
- **Files**: `src/pages/Index.tsx`, `src/hooks/useSurveyState.ts`, `src/components/survey/edit/`
- **Focus**: Survey creation, editing, and real-time preview functionality

### Analysis Agent  
- **Files**: `src/components/survey/analysis/`, `src/hooks/survey/useQuerySurveyResponses.ts`
- **Focus**: Response processing, statistical insights, and data visualization

### Authentication Agent
- **Files**: `src/providers/auth/`, `src/pages/Login.tsx`, `src/components/auth/`
- **Focus**: User authentication, session management, and security

### Team Management Agent
- **Files**: `src/hooks/team/`, `src/components/profile/team/`, `src/services/team/`
- **Focus**: Team creation, member management, and collaboration features

### Dashboard Agent
- **Files**: `src/pages/Dashboard.tsx`, `src/components/dashboard/`, `src/hooks/useSurveyData.ts`
- **Focus**: Survey listing, folder organization, and overview interfaces

### Public Survey Agent
- **Files**: `src/pages/PublicSurvey.tsx`, `src/components/survey/response/`
- **Focus**: Public survey participation and response collection
