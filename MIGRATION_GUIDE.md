# Community Hub Pro - Vite to Next.js Migration Guide

This document outlines the migration from Vite + React to Next.js 16 with Supabase backend integration.

## What Changed

### 1. **Project Structure**
- **Before**: Vite SPA with React Router
- **After**: Next.js 16 with App Router

### 2. **Backend**
- **Before**: Express.js server (`backend-api/`) with MongoDB
- **After**: Next.js API Routes + Supabase (PostgreSQL)
- **Status**: `backend-api/` folder is no longer needed

### 3. **Authentication**
- **Before**: Custom JWT token management
- **After**: Supabase Auth with built-in session management

### 4. **Database**
- **Before**: MongoDB with separate backend API
- **After**: PostgreSQL via Supabase with RLS (Row Level Security)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run the Project

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm run start
```

## API Routes Migration

All backend API routes have been migrated to Next.js API Routes:

- `/app/api/auth/login/route.ts` - User login
- `/app/api/auth/register/route.ts` - User registration
- `/app/api/bills/route.ts` - Bill management
- `/app/api/complaints/route.ts` - Complaint management
- `/app/api/visitors/route.ts` - Visitor management

## Database Schema

The Supabase schema includes:

- **profiles**: User profile information
- **user_roles**: User role assignments
- **units**: Apartment/unit data
- **maintenance_bills**: Billing information
- **visitors**: Visitor records
- **complaints**: Complaint tracking

All tables have Row Level Security (RLS) policies implemented for data protection.

## Key Features

### Authentication
- Supabase Auth handles user sessions
- Automatic token management
- Support for multiple roles (admin, resident, gatekeeper, committee_member)

### Database
- PostgreSQL powered by Supabase
- RLS policies for row-level security
- Automatic timestamps and audit trails

### API Routes
- Next.js API Routes replace Express
- Direct Supabase client integration
- Type-safe TypeScript implementation

## Breaking Changes

1. **No more backend-api folder** - All API logic is in `/app/api/`
2. **Environment variables** - Use `.env.local` instead of `.env` in backend-api
3. **Authentication** - Use Supabase Auth instead of custom JWT
4. **Database** - PostgreSQL via Supabase instead of MongoDB

## Deployment

### Deploy to Vercel

```bash
vercel
```

Make sure to set environment variables in Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Other Platforms

Build the project:
```bash
npm run build
npm run start
```

## Troubleshooting

### Authentication Issues
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in environment
- Check that user roles are correctly assigned in Supabase

### API Route Errors
- Check request headers include `Content-Type: application/json`
- Verify Supabase credentials in environment variables

### Database Errors
- Ensure RLS policies are correctly configured
- Check that tables exist in Supabase

## Next Steps

1. Set up your Supabase project
2. Configure environment variables
3. Deploy to Vercel or your preferred platform
4. Test the application

For Supabase setup instructions, visit: https://supabase.com/docs

For Next.js documentation, visit: https://nextjs.org/docs
