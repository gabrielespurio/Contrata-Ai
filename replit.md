# Contrata AI - Freelancer Marketplace Platform

## Overview

Contrata AI is a modern web application that connects contractors (contratantes) with freelancers for short-term, on-site services. The platform enables businesses like bars and restaurants to find temporary staff for events, while freelancers can discover work opportunities in their city.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Homepage Redesign (July 16, 2025)
- Completely redesigned homepage inspired by Workana and GetNinjas
- Added modern hero section with search functionality
- Implemented service categories grid with visual icons
- Added popular services showcase
- Included customer testimonials section
- Updated footer with improved navigation
- Enhanced mobile responsiveness and visual hierarchy
- Focused on Brazilian market with local service types

### Homepage Enhancement (July 16, 2025)
- Refined design to match Workana more closely
- Added trust section with statistics and credibility indicators
- Created "Monte sua equipe" section with dual focus on events and freelancers
- Implemented skills showcase with categorized talent listings
- Simplified "How it works" section with clear 3-step process
- Enhanced testimonials with better styling and social proof
- Improved overall visual hierarchy and professional appearance

## System Architecture

The application follows a full-stack monorepo architecture with clear separation between client and server components:

### Frontend Architecture
- **Framework**: React with Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui styling system
- **Styling**: TailwindCSS with CSS custom properties for theming
- **State Management**: TanStack Query for server state, React Context for auth
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Authentication**: JWT tokens with bcrypt for password hashing
- **API Design**: RESTful endpoints with role-based access control
- **Middleware**: Custom authentication and authorization middleware

### Database Design
- **Users**: Supports two user types (freelancer/contratante) with city-based filtering
- **Categories/Subcategories**: Hierarchical job classification system
- **Jobs**: Complete job postings with location, payment, and highlighting features
- **Applications**: Job application system with status tracking
- **Job Limits**: Weekly posting limits for free users

## Key Components

### Authentication System
- JWT-based authentication with 7-day expiration
- Role-based access control (freelancer vs contratante)
- Protected routes with user type restrictions
- Secure password hashing with bcrypt (12 rounds)

### Job Management
- Job creation with category/subcategory classification
- City-based job filtering and search
- Job highlighting feature for premium visibility
- Application tracking and status management

### User Management
- Profile management with city selection
- Premium subscription system (R$19,90/month)
- Job posting limits (3 per week for free users)
- User statistics and dashboard

### UI/UX Components
- Responsive design with mobile-first approach
- Comprehensive component library using Radix UI
- Toast notifications for user feedback
- Form validation with real-time error handling

## Data Flow

### Authentication Flow
1. User registers/logs in → JWT token generated
2. Token stored in localStorage
3. Token sent with each API request in Authorization header
4. Middleware validates token and sets user context

### Job Application Flow
1. Freelancer browses jobs with city/category filters
2. Freelancer applies to job → Application record created
3. Contratante views applications → Lists all applicants
4. Contratante selects freelancer → Application status updated

### Premium Features Flow
1. Contratante upgrades to premium → User.premium = true
2. Job highlighting purchase → Job.destaque = true for 7 days
3. Unlimited job posting access for premium users

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Drizzle ORM**: Type-safe database operations with migrations
- **Connection Pooling**: Efficient database connection management

### UI Libraries
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Performance-focused form library

### Development Tools
- **TypeScript**: Type safety across the entire stack
- **Vite**: Fast build tool with hot module replacement
- **ESBuild**: Fast JavaScript bundler for production
- **Zod**: Runtime type validation and schema definition

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle Kit manages schema migrations

### Environment Configuration
- **Development**: Hot reloading with Vite dev server
- **Production**: Express serves static files and API routes
- **Database**: PostgreSQL connection via environment variables

### Key Scripts
- `npm run dev`: Development server with hot reloading
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server
- `npm run db:push`: Deploy database schema changes

### Security Considerations
- JWT secret configuration via environment variables
- Password hashing with industry-standard bcrypt
- CORS configuration for API security
- Input validation on both client and server sides

The architecture emphasizes type safety, developer experience, and scalability while maintaining a clean separation of concerns between the frontend and backend systems.