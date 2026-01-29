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

### Complete Step-by-Step Installation Guide (For Beginners)

#### 1. Install Node.js

1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS version** (e.g., 20.x)
3. Run the installer and follow the prompts
4. Click "Next" until installation completes
5. **Restart your Terminal/PowerShell** after installation
6. Verify installation by opening Terminal/PowerShell and running:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v20.x.x and 10.x.x)

#### 2. Install PostgreSQL Database

**Option A - Using Docker (Easier and Recommended):**

1. Install Docker Desktop from [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
2. **Start Docker Desktop** (very important - must be running!)
3. Open Terminal/PowerShell and run:
   ```bash
   docker run --name postgres-racegarage -e POSTGRES_USER=simulator -e POSTGRES_PASSWORD=simulator -e POSTGRES_DB=simulator -p 5432:5432 -d postgres:15
   ```
4. Verify it's running:
   ```bash
   docker ps
   ```
   You should see the `postgres-racegarage` container

**Option B - Installing PostgreSQL directly on Windows:**

1. Download installer from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the EDB installer
3. During installation, **remember the password** you set for the "postgres" user (you'll need it!)
4. Keep port as 5432
5. After installation, open **SQL Shell (psql)** from Start Menu
6. Login as postgres user (press Enter for defaults, then enter your password)
7. Create database and user:
   ```sql
   CREATE USER simulator WITH PASSWORD 'simulator';
   CREATE DATABASE simulator OWNER simulator;
   \q
   ```

#### 3. Download the Project

1. Open Terminal/PowerShell
2. Navigate to where you want the project (e.g., Documents folder):
   
   **Windows:**
   ```powershell
   cd C:\Users\YourUsername\Documents
   ```
   
   **Mac/Linux:**
   ```bash
   cd ~/Documents
   ```

3. Clone the repository and switch to the development branch:
   ```bash
   git clone https://github.com/kbranislav1410-max/racegarage-simulator.git
   cd racegarage-simulator
   git checkout copilot/setup-nextjs-simulator-project
   ```

#### 4. Install Project Dependencies

In the project folder (make sure you're inside the `racegarage-simulator` folder), run:
```bash
npm install
```

This will download all required packages. It may take 3-5 minutes. Wait for it to complete.

#### 5. Configure Database Connection

1. In the project root folder (where you see `package.json`), create a new file named `.env`
   - **Windows**: Right-click → New → Text Document, name it `.env` (including the dot!)
   - **Mac/Linux**: Use `touch .env` command
2. Open the `.env` file in any text editor (Notepad, VS Code, etc.)
3. Add this single line:
   ```
   DATABASE_URL="postgresql://simulator:simulator@localhost:5432/simulator"
   ```
4. Save and close the file

**Important:** If you used a different port for PostgreSQL, change `5432` to your port number.

#### 6. Set Up the Database (CRITICAL STEP)

Run these commands **in order**, one at a time:

```bash
# Step 1: Generate Prisma Client (creates database access code)
npm run db:generate
```
Wait for "Generated Prisma Client" message.

```bash
# Step 2: Create all database tables
npm run db:push
```
Wait for "Your database is now in sync with your Prisma schema" message.

```bash
# Step 3 (Optional): Add sample data for testing
npm run db:seed
```
This step is **optional**. The app works without it - you can create customers/rides manually through the UI.

**Note:** If you see any errors about "datasources" or Prisma Client, make sure you pulled the latest code:
```bash
git pull origin copilot/setup-nextjs-simulator-project
```

#### 7. Start the Application

```bash
npm run dev
```

You should see:
```
▲ Next.js X.X.X
- Local:        http://localhost:3000
✓ Ready in X.Xs
```

**Leave this Terminal/PowerShell window open** - the application is running!

#### 8. Access the Application

1. Open your web browser (Chrome, Firefox, Edge, Safari)
2. Go to [http://localhost:3000](http://localhost:3000)
3. **The dashboard will load immediately** - no login required!
4. You now have full access to all features:
   - Create customers
   - Record rides
   - Generate vouchers
   - View statistics
   - And more!

### What to Do Next Time You Start the Application

Once everything is set up, starting the app is much simpler:

1. **Start PostgreSQL** (if using Docker, start Docker Desktop)
2. Open Terminal/PowerShell
3. Navigate to project folder:
   ```bash
   cd path/to/racegarage-simulator
   ```
4. Start the app:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

### Updating the Application (If You Pull New Code from GitHub)

When you pull new changes from GitHub:

```bash
# Get latest code
git pull origin copilot/setup-nextjs-simulator-project

# Regenerate Prisma Client (important!)
npm run db:generate

# Start the app
npm run dev
```

You typically **don't need** to run `npm install` or `db:push` again unless you're told to.

### Troubleshooting Common Issues

**Problem: "npm: command not found" or "node: command not found"**
- **Solution**: Restart your Terminal/PowerShell after installing Node.js. If still not working, reinstall Node.js and make sure to check "Add to PATH" during installation.

**Problem: "Can't connect to database" or "Connection refused"**
- **Solution**: 
  - Make sure PostgreSQL is running
  - For Docker: Start Docker Desktop, then check with `docker ps` - you should see `postgres-racegarage` container
  - For PostgreSQL: Open Windows Services and check if PostgreSQL service is running
  - Verify your `.env` file has the correct `DATABASE_URL`

**Problem: "Port 3000 is already in use"**
- **Solution**: 
  - Close any other applications using port 3000
  - Or change the port: Set environment variable `PORT=3001` before running `npm run dev`
  - On Windows: `$env:PORT=3001; npm run dev`
  - On Mac/Linux: `PORT=3001 npm run dev`

**Problem: "Port 5432 is already in use"**
- **Solution**: 
  - Stop other PostgreSQL instances
  - Or use a different port in both Docker command (e.g., `-p 5433:5432`) and DATABASE_URL (e.g., `localhost:5433`)

**Problem: "relation 'User' does not exist" or "Table doesn't exist"**
- **Solution**: You need to create the database tables:
  ```bash
  npm run db:push
  ```
  If tables still don't appear, force reset:
  ```bash
  npx prisma db push --force-reset
  ```

**Problem: Customer creation shows "An error occurred"**
- **Solution**: This was a bug in audit logging. Pull the latest code:
  ```bash
  git pull origin copilot/setup-nextjs-simulator-project
  npm run db:generate
  ```

**Problem: Dashboard shows zeros (0) everywhere**
- **Solution**: This was fixed in commit 1366dda. Pull the latest code:
  ```bash
  git pull origin copilot/setup-nextjs-simulator-project
  npm run dev
  ```
  The dashboard now displays real statistics from the database.

**Problem: Voucher creation button doesn't work**
- **Solution**: This was fixed in commit 87bec46. Pull the latest code:
  ```bash
  git pull origin copilot/setup-nextjs-simulator-project
  ```

**Problem: "Module not found: Can't resolve '@/lib/prisma'"**
- **Solution**: Import errors were fixed. Pull the latest code and regenerate Prisma Client:
  ```bash
  git pull origin copilot/setup-nextjs-simulator-project
  npm run db:generate
  ```

**Problem: "PrismaClientConstructorValidationError: Unknown property datasources"**
- **Solution**: This was a Prisma 7.x compatibility issue. Pull the latest code:
  ```bash
  git pull origin copilot/setup-nextjs-simulator-project
  npm run db:seed
  ```

**Problem: Multiple lockfiles warning from Next.js**
- **Solution**: This warning is harmless but if it bothers you:
  - Remove `package-lock.json` from parent directories (keep only the one in project root)
  - Or add `turbopack.root` to `next.config.js` (advanced)

### Quick Start Summary (For Experienced Users)

For developers familiar with the stack:

```bash
# 1. Prerequisites: Node.js 18+, PostgreSQL 14+ (or Docker)

# 2. Clone and setup
git clone https://github.com/kbranislav1410-max/racegarage-simulator.git
cd racegarage-simulator
git checkout copilot/setup-nextjs-simulator-project
npm install

# 3. Configure database
echo 'DATABASE_URL="postgresql://simulator:simulator@localhost:5432/simulator"' > .env

# 4. Setup database (run in order)
npm run db:generate
npm run db:push

# 5. (Optional) Add sample data
npm run db:seed

# 6. Start development server
npm run dev

# 7. Open http://localhost:3000
```

### Important Notes

- ✅ **Authentication is disabled** - Direct access to all features, no login required
- ✅ **Works without seed data** - Create customers, rides, etc. directly through the UI
- ✅ **Slovak language interface** - Main UI elements translated (Dashboard, Customers, Vouchers)
- ✅ **Real-time statistics** - Dashboard displays actual data from your database
- ✅ **All features functional** - Customer management, voucher system, and more

### Running the Application After Initial Setup

Once everything is configured, simply:

```bash
# Ensure PostgreSQL/Docker is running
# Navigate to project folder
cd path/to/racegarage-simulator

# Start the application
npm run dev

# Open http://localhost:3000
```

### When to Run Each Command

| Command | When to Use |
|---------|-------------|
| `npm install` | Only when: first setup, or after pulling code that changes dependencies (package.json) |
| `npm run db:generate` | After: pulling new code from GitHub, or changes to prisma/schema.prisma |
| `npm run db:push` | After: pulling new code that changes database schema |
| `npm run db:seed` | Optional: when you want sample/test data |
| `npm run dev` | Every time: you want to start the application |

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
