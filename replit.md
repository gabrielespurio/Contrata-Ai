# Contrata AI - Freelancer Marketplace Platform

## Overview

Contrata AI is a modern web application that connects contractors (contratantes) with freelancers for short-term, on-site services. The platform enables businesses like bars and restaurants to find temporary staff for events, while freelancers can discover work opportunities in their city.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Location and Currency Improvements (July 28, 2025)
- Enhanced location capture system to show proper address instead of raw coordinates
- Implemented reverse geocoding using OpenStreetMap's Nominatim service to convert GPS coordinates to readable addresses
- Added interactive mini-map display showing captured location with OpenStreetMap embed
- Added direct link to Google Maps for precise location viewing
- Implemented Brazilian currency formatting (Real) for job payment field
- Created formatCurrency function with proper BRL formatting using Intl.NumberFormat
- Added real-time currency input masking with automatic decimal placement
- Improved user experience with visual feedback for location capture and currency input

### Authentication System Fixed (July 26, 2025)
- Fixed critical authentication error preventing job creation ("Token not provided")
- Replaced Clerk authentication with custom JWT authentication system
- Created proper login/signup endpoints with password hashing
- Updated frontend to use real authentication with localStorage token management
- Fixed authentication context and app structure to prevent context errors
- All protected routes now work correctly with proper token validation

### Enhanced Onboarding with Category Selection for Contractors (July 26, 2025)
- Added 5th step in ProfileSetup specifically for contractors to select categories of interest
- Contractors can now select up to 3 service categories they're most interested in hiring
- Added search functionality for easy category filtering
- Visual feedback with selected categories displayed as removable badges
- Updated step validation to require category selection for contractors
- Enhanced progress indicator to show 5 steps for contractors vs 4 for freelancers

### Registration Form Simplification (July 26, 2025)
- Removed "Tipo de usuário" field from registration form
- Removed "Cidade" field from registration form
- Set default values: type='freelancer', city='São Paulo'
- Simplified registration flow to only require name, email, and password
- User type and city selection now handled in onboarding flow instead

### Onboarding Flow Implementation (July 26, 2025)
- Configured complete user onboarding system for profile identification after registration
- Implemented automatic redirection to profile setup (/profile-setup) for new users
- Enhanced SimpleAuthContext with needsOnboarding flag and completeOnboarding method
- Created OnboardingRedirectSimple component to manage automatic redirects
- Updated login flow to automatically redirect users needing onboarding
- Fixed ProfileSetup component to work with unified authentication system
- Users now complete multi-step profile setup (user type, personal info, address, categories)
- System prevents access to main application until onboarding is completed

### Migration to Replit Environment - Security Fix (July 26, 2025)
- Successfully completed migration from Replit Agent to standard Replit environment
- Fixed database connection security issue with proper URL parsing
- Configured secure environment variables for DATABASE_URL via Replit Secrets
- Cleaned up database connection string parsing to handle URL encoding
- Application now runs cleanly with proper client/server separation
- All security vulnerabilities addressed with environment variable usage

### Clerk-Only Authentication System (July 20, 2025)
- Completely removed JWT authentication system in favor of Clerk-only authentication
- Removed all JWT-related files: AuthContext.tsx, Login.tsx, Register.tsx, auth middleware
- Created new Clerk-based authentication middleware in server/middleware/clerkAuth.ts
- Updated all API routes to use Clerk authentication instead of JWT
- Enhanced SimpleClerkAuthContext to support user synchronization with database
- Redirected all login/register routes to use Clerk authentication
- Added getUserByClerkId method to database storage for Clerk user lookups
- Updated user creation and application creation to handle proper type casting
- System now exclusively uses Clerk for authentication with database sync functionality

## Previous Changes

### CPF/CNPJ/Phone Field Formatting (July 20, 2025)
- Implemented automatic field formatting for CPF, CNPJ, phone numbers, and CEP
- Created comprehensive mask utilities in `@/lib/masks.ts` with validation functions
- Applied formatting to all registration forms (freelancer, pessoa física, pessoa jurídica)
- CPF format: 000.000.000-00 with real-time validation
- CNPJ format: 00.000.000/0000-00 with real-time validation  
- Phone format: (00) 00000-0000 supporting both landline and mobile
- CEP format: 00000-000 with automatic address lookup
- Enhanced user experience with proper input masking and length limits

### Migration to Replit Environment (July 20, 2025)
- Successfully migrated project from Replit Agent to standard Replit environment
- Fixed hardcoded database credentials security vulnerability
- Set up PostgreSQL database with proper schema migrations via Drizzle
- Implemented authentication system fallback (Clerk → JWT when keys unavailable)
- Fixed module export errors and authentication context integration
- Application now runs cleanly with proper client/server separation
- All dependencies properly configured for Replit deployment

### Clerk Authentication Integration (July 19, 2025)
- Integrated Clerk authentication system as an alternative to custom JWT authentication
- Created ClerkAuthProvider context for managing Clerk user state
- Added ClerkLogin and ClerkRegister pages with custom Clerk components
- Implemented user type selection (freelancer/contractor) after Clerk registration
- Added backend endpoint `/api/auth/sync-clerk-user` to sync Clerk users with local database
- Enhanced database schema with optional `clerkId` field for Clerk integration
- Created ClerkDemo component to guide users through Clerk setup
- Maintained backward compatibility with existing JWT authentication system
- Added conditional rendering to use Clerk when valid keys are provided
- Environment variables configured for VITE_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY

### Advanced Multi-Step Registration System (July 19, 2025)
- Implemented complete 4-step registration flow for contractors with visual progress indicator
- Step 1: User type selection (Freelancer vs Contractor)  
- Step 2: Person type selection for contractors (Individual vs Company)
- Step 3: Personal/company data forms with specific fields (CPF/CNPJ, contact info)
- Step 4: Address form with automatic CEP lookup via ViaCEP API
- Step 5: Service category selection with scalable search interface
- Enhanced category selection with search functionality and tag-based UI
- Supports large datasets (200+ categories) with real-time filtering
- Visual selected categories as removable tags above search field
- Disabled state for unselected categories when limit (3) is reached
- Removed password field temporarily for development
- Enhanced UX with step-by-step navigation and back buttons
- Added form validation and error handling for address API calls

### Security Improvements (July 19, 2025)
- Fixed hardcoded database credentials security vulnerability
- Implemented proper environment variable usage for DATABASE_URL
- Enhanced JWT secret management
- Added proper error handling for missing environment variables

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