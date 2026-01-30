# Database Setup Guide

This project uses PostgreSQL with Prisma ORM.

## Prerequisites

- PostgreSQL 14+ installed and running
- Node.js 18+ installed

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `DATABASE_URL` in `.env` with your PostgreSQL credentials:
   ```
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   ```

## Database Commands

### Generate Prisma Client
```bash
npm run db:generate
```

### Push Schema to Database (for development)
```bash
npm run db:push
```

### Create and Apply Migration
```bash
npm run db:migrate
```

### Seed Database
Seeds the database with initial ADMIN and STAFF users:
```bash
npm run db:seed
```

### Open Prisma Studio (Database GUI)
```bash
npm run db:studio
```

## Default Users

After running the seed script, you can login with:

- **Admin User**
  - Email: `admin@local.test`
  - Password: `admin123!`
  - Role: ADMIN

- **Staff User**
  - Email: `staff@local.test`
  - Password: `staff123!`
  - Role: STAFF

## Database Schema

### Models

- **User** - Staff members (ADMIN, STAFF)
- **Customer** - Customer accounts with contact information
- **RideSession** - Simulator ride sessions
- **ChallengeMonth** - Monthly challenge configurations
- **ChallengeAttempt** - Customer challenge attempts and lap times
- **Reservation** - Booking management
- **PaymentRecord** - Payment tracking with 50/50 split
- **Voucher** - Voucher creation and redemption
- **AuditLog** - Activity logging

## Quick Start

1. Start PostgreSQL
2. Create database: `createdb racegarage`
3. Run: `npm run db:push && npm run db:seed`
4. Start dev server: `npm run dev`
