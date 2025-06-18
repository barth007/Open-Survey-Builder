
# Survey Application - Comprehensive Documentation

A modern, self-hosted survey creation and management platform built for teams who value data privacy and control.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema & Architecture](#database-schema--architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Key Features Implementation](#key-features-implementation)
6. [File Structure & Responsibilities](#file-structure--responsibilities)
7. [Authentication & Security](#authentication--security)
8. [Setup & Development](#setup--development)
9. [Deployment Guide](#deployment-guide)
10. [API Integration](#api-integration)

## Project Overview

This survey application provides a comprehensive solution for creating, distributing, and analyzing surveys while maintaining full control over your data. Built with modern web technologies, it offers enterprise-grade features in a user-friendly interface.

### Core Capabilities
- **Survey Creation & Management**: Drag-and-drop interface for creating complex surveys
- **Team Collaboration**: Real-time collaboration with role-based access control
- **Advanced Analytics**: Real-time response analysis with statistical insights
- **Recording Features**: Screen and webcam recording for user testing
- **Self-Hosted**: Complete data ownership and privacy control

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for consistent UI components
- **React Router DOM** for client-side routing
- **TanStack Query** for server state management
- **React Hook Form** with Zod validation
- **Recharts** for data visualization
- **DND Kit** for drag-and-drop functionality

### Backend & Database
- **Supabase** (PostgreSQL) for database and authentication
- **Row Level Security (RLS)** for data access control
- **Real-time subscriptions** for live collaboration
- **Edge Functions** for custom backend logic

### Build & Development
- **TypeScript** for type safety
- **ESLint** for code linting
- **Vitest** for testing
- **PostCSS** for CSS processing

## Database Schema & Architecture

### Core Tables

#### 1. Users & Authentication
```sql
-- Managed by Supabase Auth (auth.users)
-- Custom profiles table for additional user data
profiles (
  id: uuid (primary key, references auth.users)
  email: text
  full_name: text
  avatar_url: text
  role: text (default: 'user')
  status: text (default: 'pending')
  updated_at: timestamp
)
```

#### 2. Survey Management
```sql
surveys (
  id: uuid (primary key)
  name: text (survey title)
  description: text
  questions: jsonb (array of question objects)
  is_published: boolean (default: false)
  public_code: varchar (unique identifier for public access)
  user_id: uuid (references auth.users)
  team_id: uuid (references teams.id, nullable)
  folder_id: uuid (references folders.id, nullable)
  order: integer (for sorting)
  
  -- Welcome page configuration
  welcome_title: text
  welcome_message: text
  welcome_instructions: text
  welcome_button_text: text
  
  -- Thank you page configuration
  thank_you_title: text
  thank_you_message: text
  thank_you_button_text: text
  redirect_url: text
  
  -- Recording settings
  recording_enabled: boolean (default: false)
  recording_required: boolean (default: false)
  
  created_at: timestamp
)
```

#### 3. Response Management
```sql
survey_responses (
  id: uuid (primary key)
  survey_id: uuid (references surveys.id)
  answers: jsonb (array of answer objects)
  participant_id: varchar (anonymous identifier)
  participant_email: text (optional)
  metadata: jsonb (browser info, timestamps, etc.)
  submitted_at: timestamp
  deleted_at: timestamp (for soft delete)
)

response_deletions (
  id: uuid (primary key)
  survey_id: uuid
  participant_id: text
  participant_email: text
  deleted_by: uuid (references auth.users)
  deletion_reason: text
  responses_count: integer
  responses_backup: jsonb
  deleted_at: timestamp
)
```

#### 4. Team Collaboration
```sql
teams (
  id: uuid (primary key)
  name: text
  description: text
  owner_id: uuid (references auth.users)
  created_at: timestamp
)

team_members (
  id: uuid (primary key)
  team_id: uuid (references teams.id)
  user_id: uuid (references auth.users)
  role: text ('owner', 'admin', 'member')
  joined_at: timestamp
)

team_invitations (
  id: uuid (primary key)
  team_id: uuid (references teams.id)
  email: text
  invitation_code: text (unique)
  status: text ('pending', 'accepted', 'expired')
  expires_at: timestamp
  created_at: timestamp
)
```

#### 5. Organization
```sql
folders (
  id: uuid (primary key)
  name: text
  user_id: uuid (references auth.users)
  order: integer
  created_at: timestamp
)
```

#### 6. Recording System
```sql
question_recordings (
  id: uuid (primary key)
  response_id: uuid (references survey_responses.id)
  question_id: text
  recording_url: text
  recording_type: text ('screen-webcam')
  file_format: text
  file_size_bytes: bigint
  duration_seconds: integer
  metadata: jsonb
  created_at: timestamp
)
```

### Database Functions

The application uses several PostgreSQL functions for complex operations:

- `generate_unique_public_code()`: Creates unique survey access codes
- `delete_responses_by_participant()`: Handles bulk response deletion with audit trail
- `create_question_recording()`: Manages recording metadata
- `is_team_member()`, `is_team_admin()`, `user_owns_team()`: Team access control
- `validate_auth_session()`: Session validation
- `process_team_invitation()`: Team invitation processing

### Row Level Security (RLS)

All tables implement RLS policies to ensure users can only access their own data or data they have permission to see:

- **Surveys**: Users can only see surveys they own or are team members of
- **Responses**: Users can only see responses to their surveys
- **Teams**: Users can only see teams they belong to
- **Folders**: Users can only see their own folders

## Frontend Architecture

### Type System

#### Core Types (`src/types/`)

**Survey Types** (`survey.ts`):
```typescript
interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  isPublished: boolean;
  publicCode?: string;
  teamId?: string;
  // ... welcome/thank you page fields
  // ... recording settings
}

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  isRequired: boolean;
  options: QuestionOption[];
  conditionalLogic?: ConditionalLogic;
  // ... media and configuration
}
```

**Team Types** (`team-types.ts`):
```typescript
interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberCount: number;
  role: TeamRole;
}

interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: TeamRole;
  joinedAt: string;
  profile: UserProfile;
}
```

### State Management Pattern

The application uses a hybrid approach:

1. **Server State**: TanStack Query for all API calls and caching
2. **Local UI State**: React useState and useReducer
3. **Form State**: React Hook Form with Zod validation
4. **Global State**: Context API for authentication and team data

### Component Architecture

#### Layout Components
- `SurveyLayout`: Main application layout with navigation
- `SurveyNavigationHeader`: Top navigation with collaboration features
- `SurveySidebar`: Left sidebar for navigation and organization

#### Feature Components
- `SurveyEditor`: Main survey editing interface
- `AnswersTab`: Response analysis and visualization
- `TeamManagement`: Team collaboration features
- `RecordingSystem`: Screen/webcam recording functionality

## Key Features Implementation

### 1. Survey Creation System

**Primary Files**:
- `src/pages/Index.tsx`: Main survey editor page
- `src/components/survey/edit/`: Survey editing components
- `src/hooks/useSurveyState.ts`: Survey state management

**Flow**:
1. User creates survey via dashboard
2. Survey editor loads with real-time autosave
3. Questions managed via drag-and-drop interface
4. Smart batching prevents excessive API calls
5. Conditional logic system for question branching

**Key Components**:
- `QuestionSection`: Question management with DND
- `WelcomeCard`/`ThankYouCard`: Page customization
- `PreviewTab`: Real-time survey preview

### 2. Real-time Collaboration

**Primary Files**:
- `src/hooks/useActiveUsers.ts`: Active user tracking
- `src/components/survey/SurveyNavigationHeader.tsx`: User presence UI
- `src/hooks/survey/useSmartAutoSave.ts`: Collaborative saving

**Implementation**:
- WebSocket connections via Supabase Realtime
- Optimistic updates with conflict resolution
- Visual indicators for active collaborators
- Smart auto-save with debouncing

### 3. Team Management

**Primary Files**:
- `src/components/profile/team/`: Team management UI
- `src/hooks/team/`: Team-related hooks
- `src/services/team/`: Team business logic

**Features**:
- Role-based access control (Owner, Admin, Member)
- Email invitation system with expiration
- Team survey sharing and permissions
- Audit trail for team actions

### 4. Analytics & Response Processing

**Primary Files**:
- `src/components/survey/analysis/`: Analysis components
- `src/components/AnswersTab.tsx`: Main analytics interface
- `src/hooks/survey/useQuerySurveyResponses.ts`: Response data fetching

**Capabilities**:
- Real-time response monitoring
- Statistical analysis with charts (Recharts)
- Data filtering and export (CSV)
- Response deletion with audit trail
- Outlier detection and insights

### 5. Recording System

**Primary Files**:
- `src/components/survey/recording/`: Recording components
- `src/hooks/survey/useRecordingFlow.ts`: Recording workflow
- `src/hooks/survey/useRecordingPermissions.ts`: Permission handling

**Features**:
- Screen + webcam recording
- Permission-based access control
- Recording playback and management
- Integration with survey responses

### 6. Authentication & Security

**Primary Files**:
- `src/providers/auth/`: Authentication logic
- `src/components/ProtectedRoute.tsx`: Route protection
- `src/hooks/useProfile.ts`: User profile management

**Implementation**:
- Google OAuth integration via Supabase
- JWT-based session management
- Role-based access control
- Approval workflow for new users

## File Structure & Responsibilities

### Core Pages (`src/pages/`)
- `Landing.tsx`: Marketing/landing page
- `Login.tsx`: Authentication interface
- `Dashboard.tsx`: Survey management dashboard
- `Index.tsx`: Main survey editor (313 lines - consider refactoring)
- `Profile.tsx`: User profile and team management
- `PublicSurvey.tsx`: Public survey response interface

### Component Organization (`src/components/`)

#### Survey Components (`survey/`)
- `edit/`: Survey creation and editing
  - `QuestionSection.tsx`: Question management
  - `WelcomeCard.tsx`, `ThankYouCard.tsx`: Page customization
  - `SurveyRecordingSettings.tsx`: Recording configuration
- `analysis/`: Response analysis and visualization
  - `ResponsesList.tsx`: Response data display
  - `StatisticalInsights.tsx`: Analytics dashboard
  - `RecordingsAnalysis.tsx`: Recording analysis
- `recording/`: Recording system
  - `RecordingWidget.tsx`: Recording interface
  - `RecordingPermissionDialog.tsx`: Permission handling
- `response/`: Public survey response
  - `QuestionRenderer.tsx`: Question display logic
  - Type-specific renderers for each question type

#### UI Components (`ui/`)
- shadcn/ui components with consistent theming
- `SurveyLayout.tsx`: Main application layout
- Reusable form components and dialogs

#### Feature-Specific Components
- `profile/team/`: Team management interface
- `dashboard/`: Dashboard-specific components
- `auth/`: Authentication forms and flows

### Custom Hooks (`src/hooks/`)

#### Survey Hooks (`survey/`)
- `useSurveyState.ts`: Main survey state management (375 lines - consider refactoring)
- `useQuerySurvey.ts`: Survey data fetching
- `useMutateSurvey.ts`: Survey mutations
- `useQuestionManagement.ts`: Question CRUD operations
- `useSmartAutoSave.ts`: Intelligent auto-saving
- `useSubmitResponse.ts`: Response submission

#### Team Hooks (`team/`)
- `useTeamManagement.ts`: Team CRUD operations
- `useTeamInvitation.ts`: Invitation system
- `useUserInvitations.ts`: User invitation management

#### Utility Hooks
- `useActiveUsers.ts`: Real-time user presence
- `useSurveyData.ts`: Survey data aggregation
- `useDebounce.ts`: Input debouncing
- `use-mobile.tsx`: Responsive design utilities

### Services (`src/services/`)
- `team/`: Team-related business logic
- `teamService.ts`: Legacy team service (consider migration)

### Type Definitions (`src/types/`)
- `survey.ts`: Survey and question types
- `team-types.ts`: Team collaboration types
- `survey-organization.ts`: Organization types
- `database.ts`: Database type mappings

### Utilities (`src/utils/`)
- `type-mappers.ts`: Database to frontend type conversion
- `participantUtils.ts`: Participant ID generation
- `popupBlocker.ts`: Popup blocking detection

## Authentication & Security

### Authentication Flow
1. **Google OAuth** via Supabase Auth
2. **User Profile Creation** automatic via database trigger
3. **Admin Approval** workflow for new users
4. **Session Management** with automatic refresh

### Security Implementation
- **Row Level Security (RLS)** on all database tables
- **JWT tokens** for API authentication
- **Role-based access control** for teams and surveys
- **Input validation** with Zod schemas
- **SQL injection prevention** via parameterized queries

### Permission System
```typescript
// Team permissions
type TeamRole = 'owner' | 'admin' | 'member';

// Survey access
- Owner: Full access to survey and responses
- Team Admin: Edit surveys, view responses
- Team Member: View surveys, limited response access
```

## Setup & Development

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Google OAuth credentials (optional)

### Environment Setup

1. **Clone and Install**:
```bash
git clone <repository-url>
cd survey-builder
npm install
```

2. **Supabase Configuration**:
```bash
# Update src/integrations/supabase/client.ts with your credentials
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

3. **Database Setup**:
```sql
-- Run migrations in supabase/migrations/
-- Key migrations:
-- - 20250508100000_admin_notification_trigger.sql
-- - 20250602000001_add_recording_support.sql
-- - 20250602000002_add_recording_rpc.sql
```

4. **Authentication Setup**:
   - Configure Google OAuth in Supabase Auth settings
   - Set up email templates and redirect URLs
   - Enable email confirmations (optional for development)

### Development Workflow

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Configuration Files
- `vite.config.ts`: Build configuration
- `tailwind.config.ts`: Styling configuration
- `tsconfig.json`: TypeScript configuration
- `supabase/config.toml`: Supabase project configuration

## Deployment Guide

### Production Deployment

1. **Build Application**:
```bash
npm run build
```

2. **Deploy to Hosting Platform**:
   - **Vercel/Netlify**: Connect GitHub repository
   - **VPS/Cloud**: Upload dist/ folder to web server
   - **Docker**: Use provided Dockerfile

3. **Configure Environment**:
   - Set production Supabase URLs
   - Configure authentication providers
   - Set up custom domain (if applicable)

4. **Database Migration**:
   - Run all migrations in production Supabase
   - Set up RLS policies
   - Configure database functions

### Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Authentication (via Supabase dashboard)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Performance Optimizations
- **Code Splitting**: Implemented via React.lazy()
- **Image Optimization**: Via Supabase Storage
- **Caching**: TanStack Query with intelligent cache management
- **Bundle Analysis**: Use `npm run build` to analyze bundle size

## API Integration

### Supabase Integration

**Database Operations**:
```typescript
// Example query pattern
const { data, error } = await supabase
  .from('surveys')
  .select('*, questions, responses(*)')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**Real-time Subscriptions**:
```typescript
// Active user tracking
const channel = supabase.channel('survey-collaboration')
  .on('presence', { event: 'sync' }, () => {
    // Handle user presence updates
  })
  .subscribe();
```

**Authentication**:
```typescript
// Google OAuth
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/dashboard`
  }
});
```

### Error Handling Patterns

```typescript
// Consistent error handling
try {
  const result = await supabase.from('table').insert(data);
  if (result.error) throw result.error;
  return result.data;
} catch (error) {
  toast({
    title: "Error",
    description: error.message,
    variant: "destructive"
  });
}
```

## Contributing & Maintenance

### Code Quality Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced code standards
- **Component Testing**: Vitest for unit tests
- **Type Safety**: Comprehensive type definitions

### Performance Monitoring
- **Bundle Size**: Monitor with build analysis
- **Database Queries**: Optimize via Supabase dashboard
- **Real-time Connections**: Monitor active subscriptions

### Common Maintenance Tasks
1. **Database Migration**: Add new fields or tables
2. **Type Updates**: Sync with database schema changes
3. **Component Refactoring**: Break down large components
4. **Performance Optimization**: Identify and fix bottlenecks

---

This documentation provides a complete foundation for understanding, maintaining, and extending the survey application. For specific implementation details, refer to the individual component files and their inline documentation.
