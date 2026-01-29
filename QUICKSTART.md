# Quick Start Guide - Community Hub Pro

## Prerequisites
- Node.js 18+ installed
- Supabase project created
- Git installed

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Supabase Credentials
1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Project Settings** → **API**
3. Copy these values:
   - Project URL
   - Anon Key
   - Service Role Key

### 3. Create `.env.local`
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
```

### 4. Run Development Server
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Testing the Application

### Create a Test Account
1. Go to http://localhost:3000/auth
2. Click "Sign Up"
3. Enter:
   - Email: test@example.com
   - Password: TestPassword123!
   - Full Name: Test User
   - Phone: +1234567890

### Access Dashboard
1. Once signed up, you'll be redirected to the dashboard
2. Navigate using the sidebar
3. View your profile in the top right

## Common Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Run linting
npm run lint

# Run tests
npm run test
```

## File Structure
```
app/                 # Next.js pages and API routes
src/                 # React components and utilities
public/              # Static files
supabase/            # Database schema
```

## Architecture Overview

```
User Browser
    ↓
Next.js App (localhost:3000)
    ↓
API Routes (/app/api/)
    ↓
Supabase Auth + PostgreSQL
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/bills` | GET/POST | Manage bills |
| `/api/complaints` | GET/POST | Manage complaints |
| `/api/visitors` | GET/POST | Manage visitors |

## Troubleshooting

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Supabase Connection Error
- Check `.env.local` values are correct
- Verify Supabase project is active
- Check internet connection

### Database Errors
- Ensure RLS policies are enabled in Supabase
- Verify tables exist in database
- Check user has correct role assignments

## Deployment

### Deploy to Vercel
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Deploy!

```bash
vercel
```

### Deploy to Other Platforms
Build first:
```bash
npm run build
npm run start
```

## Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

See `MIGRATION_GUIDE.md` for detailed migration information.

## Need Help?

1. Check the browser console for errors
2. Review API responses in Network tab
3. Check Supabase logs in your project dashboard
4. Read `MIGRATION_GUIDE.md` for detailed instructions

---

**Happy coding!** 🚀
