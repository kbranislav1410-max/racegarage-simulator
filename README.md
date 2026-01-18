# Racegarage Simulator

A Next.js 14+ racing simulator management system with PostgreSQL and Prisma.

## Features

- 🏎️ Customer and ride session management
- 📅 Reservation and booking system
- 🏆 Monthly challenges and leaderboards
- 💰 Payment tracking with 50/50 financial split
- 🎟️ Voucher creation and redemption
- 👥 Staff authentication (ADMIN/STAFF roles) - **Currently disabled for easy testing**
- 📊 Audit logging

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui utilities
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier

## Getting Started on Localhost

### Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/) (choose LTS version)
- **PostgreSQL 14+** - Choose one option below:
  - **Option A (Recommended)**: Docker Desktop - [Download here](https://www.docker.com/products/docker-desktop/)
  - **Option B**: PostgreSQL directly - [Download here](https://www.postgresql.org/download/)

### Step-by-Step Installation Guide

#### 1. Install Node.js

1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (e.g., 20.x)
3. Run the installer and follow the prompts
4. Click "Next" until installation completes
5. Verify installation by opening Terminal/PowerShell and running:
   ```bash
   node --version
   npm --version
   ```

#### 2. Install PostgreSQL Database

**Option A - Using Docker (Easier):**

1. Install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop
3. Open Terminal/PowerShell and run:
   ```bash
   docker run --name postgres-racegarage -e POSTGRES_USER=simulator -e POSTGRES_PASSWORD=simulator -e POSTGRES_DB=simulator -p 5432:5432 -d postgres:15
   ```

**Option B - Installing PostgreSQL directly on Windows:**

1. Download installer from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the EDB installer
3. During installation, remember the password you set for the "postgres" user
4. Keep port as 5432
5. After installation, open SQL Shell (psql) from Start Menu
6. Login as postgres user (use the password you set during installation)
7. Create database and user:
   ```sql
   CREATE USER simulator WITH PASSWORD 'simulator';
   CREATE DATABASE simulator OWNER simulator;
   \q
   ```

#### 3. Download the Project

1. Open Terminal/PowerShell
2. Navigate to where you want the project (e.g., C:\ on Windows or ~/Projects on Mac):
   ```bash
   cd C:\
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/kbranislav1410-max/racegarage-simulator.git
   cd racegarage-simulator
   git checkout copilot/setup-nextjs-simulator-project
   ```

#### 4. Install Project Dependencies

In the project folder, run:
```bash
npm install
```

This will download all required packages (may take a few minutes).

#### 5. Configure Database Connection

1. Create a `.env` file in the project root folder (same folder as package.json)
2. Add the following content:
   ```
   DATABASE_URL="postgresql://simulator:simulator@localhost:5432/simulator"
   ```

**Note for Docker users:** If you used Docker and it assigned a different port, adjust the port number in the URL.

#### 6. Set Up the Database

Run these commands in order:

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:push

# (Optional) Seed sample data
npm run db:seed
```

**Note:** The seed step is optional. The application works without sample data - you can create customers and other records through the UI.

#### 7. Start the Application

```bash
npm run dev
```

You should see:
```
- Local:        http://localhost:3000
- Ready in X.Xs
```

#### 8. Access the Application

1. Open your web browser
2. Go to [http://localhost:3000](http://localhost:3000)
3. **You'll be automatically logged in** (authentication is disabled for easy testing)
4. The dashboard will load immediately - no login required!

### Troubleshooting

**Problem: "npm: command not found" or "node: command not found"**
- Solution: Restart your Terminal/PowerShell after installing Node.js

**Problem: "Can't connect to database"**
- Solution: Make sure PostgreSQL is running (or Docker Desktop is running if you used Docker)
- For Docker: `docker ps` should show the postgres-racegarage container
- For PostgreSQL: Check if the service is running in Windows Services

**Problem: "Port 3000 is already in use"**
- Solution: Close any other applications using port 3000, or change the port by setting `PORT=3001` before running `npm run dev`

**Problem: "Port 5432 is already in use"**
- Solution: Either stop other PostgreSQL instances, or use a different port (update both Docker command and DATABASE_URL)

**Problem: Database tables don't exist**
- Solution: Run `npm run db:push --force-reset` to recreate all tables

**Problem: Customer creation shows "An error occurred"**
- Solution: This has been fixed in the latest version. Run `git pull origin copilot/setup-nextjs-simulator-project` to get the latest code

### Quick Start Summary

For experienced users, here's the quickstart:

```bash
# 1. Install prerequisites: Node.js 18+ and PostgreSQL 14+

# 2. Clone and setup
git clone https://github.com/kbranislav1410-max/racegarage-simulator.git
cd racegarage-simulator
git checkout copilot/setup-nextjs-simulator-project
npm install

# 3. Configure database
echo 'DATABASE_URL="postgresql://simulator:simulator@localhost:5432/simulator"' > .env

# 4. Setup database
npm run db:generate
npm run db:push

# 5. (Optional) Add sample data
npm run db:seed

# 6. Start the application
npm run dev

# 7. Open http://localhost:3000
```

### Default Login Credentials (if authentication is enabled)

- **Admin**: admin@local.test / admin123!
- **Staff**: staff@local.test / staff123!

**Note:** Authentication is currently disabled. You have full access to all features without logging in.

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
