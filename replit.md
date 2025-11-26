# Contrata AI - Freelancer Marketplace Platform

## Overview

Contrata AI is a web application connecting contractors with freelancers for short-term, on-site services. It enables businesses like bars and restaurants to find temporary staff for events, and freelancers to discover local work opportunities. The platform aims to streamline the hiring process for temporary staff and provide accessible job opportunities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application employs a full-stack monorepo architecture, separating client and server components.

### UI/UX Decisions
- **Responsive Design**: Mobile-first approach.
- **Component Library**: Radix UI for accessible, unstyled primitives, styled with shadcn/ui.
- **Styling**: TailwindCSS with CSS custom properties for theming.
- **Visuals**: Homepage redesign inspired by Workana and GetNinjas, featuring a modern hero section, service categories grid, popular services showcase, and testimonials.
- **User Flow**: Multi-step registration and onboarding process with visual progress indicators, including category selection and address lookup.
- **Location & Currency**: Enhanced location capture with OpenStreetMap reverse geocoding and map display, and Brazilian Real (BRL) currency formatting.

### Technical Implementations
- **Frontend**: React with Vite, Wouter for routing, TanStack Query for server state, React Context for authentication, React Hook Form with Zod for forms.
- **Backend**: Node.js with Express.js.
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries.
- **Authentication**: Custom JWT tokens with bcrypt hashing, supporting role-based access control.
- **API Design**: RESTful endpoints with custom authentication and authorization middleware.
- **Security**: Environment variables for sensitive data (e.g., database credentials, JWT secret), bcrypt for password hashing, CORS configuration, and input validation.

### Feature Specifications
- **Authentication System**: JWT-based with role-based access control (freelancer vs. contratante), protected routes, and secure password hashing.
- **Job Management**: Creation with category/subcategory classification, city-based filtering, highlighting feature, and application tracking.
- **User Management**: Profile management, city selection, and a premium subscription system offering benefits like unlimited job postings.
- **Onboarding**: Multi-step process for new users to set up profiles, including user type selection, personal/company data, address, and service categories.
- **Form Formatting**: Automatic field formatting for CPF, CNPJ, phone numbers, and CEP with real-time validation and lookup (ViaCEP API for CEP).

## External Dependencies

- **Database**: Neon Database (serverless PostgreSQL), Drizzle ORM.
- **UI Libraries**: Radix UI, Tailwind CSS, Lucide React (icons), React Hook Form.
- **Development Tools**: TypeScript, Vite, ESBuild, Zod.
- **APIs**: OpenStreetMap Nominatim (reverse geocoding), ViaCEP API (address lookup).