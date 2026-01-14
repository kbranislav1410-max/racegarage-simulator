# Racegarage Simulator

A Next.js 14+ racing simulator management system with PostgreSQL and Prisma.

## Features

- 🏎️ Customer and ride session management
- 📅 Reservation and booking system
- 🏆 Monthly challenges and leaderboards
- 💰 Payment tracking with 50/50 financial split
- 🎟️ Voucher creation and redemption
- 👥 Staff authentication (ADMIN/STAFF roles)
- 📊 Audit logging

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui utilities
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your database (see [DATABASE.md](./DATABASE.md) for details):
   ```bash
   cp .env.example .env
   # Update DATABASE_URL in .env
   npm run db:push
   npm run db:seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Default Login Credentials

- **Admin**: admin@local.test / admin123!
- **Staff**: staff@local.test / staff123!

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts           # Database seeding script
├── src/
│   ├── app/              # Next.js app directory (routes)
│   ├── components/       # React components
│   ├── contexts/         # React contexts (Auth)
│   └── lib/              # Utilities and helpers
│       └── prisma/       # Prisma client wrapper
├── public/               # Static assets
└── DATABASE.md          # Database setup guide
```

## Documentation

- [Database Setup](./DATABASE.md) - Detailed database configuration guide

## License

Private project
