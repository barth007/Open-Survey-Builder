
# Survey Application

A modern, self-hosted survey creation and management platform built for teams who value data privacy and control.

## Overview

This survey application provides a comprehensive solution for creating, distributing, and analyzing surveys while maintaining full control over your data. Built with modern web technologies, it offers enterprise-grade features in a user-friendly interface.

## Key Features

### 🎯 Survey Creation & Management
- **Intuitive Survey Builder**: Drag-and-drop interface for creating complex surveys
- **Multiple Question Types**: Text, multiple choice, checkboxes, Likert scales (5, 7, and 10-point)
- **Conditional Logic**: Dynamic question branching based on previous responses
- **Media Support**: Add images, videos, and GIFs to questions and options
- **Custom Branding**: Personalize welcome and thank-you pages
- **Figma Integration**: Embed Figma prototypes for user testing

### 👥 Team Collaboration
- **Team Workspaces**: Organize surveys across multiple teams
- **Role-Based Access**: Owner, admin, and member permissions
- **Real-time Collaboration**: See who's working on surveys in real-time
- **Folder Organization**: Structure surveys with folders and categories
- **Team Invitations**: Easy invitation system with email notifications

### 📊 Advanced Analytics
- **Real-time Responses**: Monitor survey submissions as they happen
- **Statistical Insights**: Comprehensive analysis with charts and graphs
- **Data Export**: CSV export for further analysis
- **Response Filtering**: Filter and analyze specific response segments
- **Visual Charts**: Multiple chart types powered by Recharts

### 🔒 Privacy & Security
- **Self-Hosted**: Deploy on your own infrastructure
- **Data Ownership**: Complete control over your survey data
- **Secure Authentication**: Google OAuth integration
- **Private Surveys**: Control access with invitation-only surveys
- **Response Limits**: Set maximum response counts

### 🚀 Distribution & Sharing
- **Public Links**: Generate shareable survey links
- **Embed Codes**: Embed surveys in websites and applications
- **Preview Mode**: Test surveys before publishing
- **Mobile Responsive**: Works seamlessly across all devices

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Google OAuth
- **Charts**: Recharts library
- **Icons**: Lucide React
- **Drag & Drop**: DND Kit
- **Build Tool**: Vite

## Project Goals

### Primary Objectives
- **Data Privacy**: Provide a survey platform where organizations maintain complete control over their data
- **Team Collaboration**: Enable seamless collaboration between team members on survey projects
- **User Experience**: Deliver an intuitive interface that makes survey creation accessible to non-technical users
- **Flexibility**: Support diverse survey types from simple feedback forms to complex research studies

### Use Cases
- **Market Research**: Conduct customer feedback and market analysis
- **Employee Surveys**: Internal feedback and engagement surveys
- **Academic Research**: Educational institutions and research projects
- **User Testing**: UX research with Figma prototype integration
- **Event Feedback**: Post-event surveys and evaluations

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for backend services)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd survey-application
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

4. Start the development server:
```bash
npm run dev
```

### Deployment

The application can be deployed to any hosting platform that supports Node.js applications:

- **Vercel/Netlify**: For serverless deployment
- **VPS/Cloud**: For self-hosted deployment
- **Docker**: Containerized deployment (Dockerfile included)

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support, please open an issue in the repository or contact the development team.
