# Society Maintenance Tracker

Society Maintenance Tracker is a full-stack maintenance and complaint management platform for residential societies.

It supports two roles:

- Resident
- Admin

Residents can register, log in, raise complaints, upload photos, and view notices and their complaint history.
Admins can review all complaints, filter and search them, resolve complaints with notes and optional proof photos, manage notices, configure overdue thresholds, and inspect complaint history.

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- NextAuth/Auth.js
- Zod
- React Hook Form
- TanStack Query
- Recharts
- Cloudinary
- Resend
- bcrypt

## Features Implemented

- Credentials authentication
- Role-based access control
- Resident dashboard
- Admin dashboard
- Complaint creation and tracking
- Complaint history audit trail
- Notice board
- Broadcast notices
- Overdue complaint tracking
- Configurable overdue threshold
- API routes for full-stack operations

## Prerequisites

- Node.js 18+ or 20+
- PostgreSQL database
- Cloudinary account
- Resend account

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Update `.env` with your real values:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`

4. Generate Prisma client:

```bash
npx prisma generate
```

5. Run database migrations:

```bash
npx prisma migrate dev
```

6. Seed the database:

```bash
npm run seed
```

## Start the Project

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Other Commands

- Build for production:

```bash
npm run build
```

- Start production server:

```bash
npm start
```

- Open Prisma Studio:

```bash
npm run prisma:studio
```

- Run ESLint:

```bash
npm run lint
```

## Sample Admin Account

The seed script creates a sample admin user in the database pointed to by `DATABASE_URL`:

- Email: `admin@societytracker.local`
- Password: `Admin@12345`

If you deploy with Neon, make sure you run the seed script against the Neon database too, otherwise the default admin will not exist in production.

Example:

```bash
# Set DATABASE_URL to your Neon connection string first
npm run seed
```

There is no public admin registration flow by design. Admin access should come from the seeded account or from manually creating another admin user in the database.

## API Routes

### Authentication

- `POST /api/register`
- `POST /api/login`
- `POST /api/logout`

### Resident

- `GET /api/complaints`
- `POST /api/complaints`
- `GET /api/complaints/:id/history`
- `GET /api/notices`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/complaints`
- `PATCH /api/admin/complaints/:id`
- `GET /api/admin/complaints/:id`
- `POST /api/admin/notices`
- `PATCH /api/admin/config`
- `POST /api/uploads/photo`

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `components/` - UI and feature components
- `lib/` - shared helpers, auth, Prisma client, and business logic
- `prisma/` - Prisma schema and seed script
- `middleware.ts` - route protection and role checks

## Notes

- Complaint history is append-only.
- Resolving a complaint automatically closes it.
- Admins are routed to the admin dashboard and do not use resident complaint pages.
- Overdue complaints are prioritized in the admin list.
- The project is structured to support later phases like photo uploads and email notifications.
