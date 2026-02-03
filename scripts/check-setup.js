#!/usr/bin/env node

/**
 * Database Setup Checker
 * Checks if the database is properly configured and seeded
 */

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma Client with adapter (required for Prisma 7.x)
const prisma = new PrismaClient({ adapter });

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function checkSetup() {
  log('\n🔍 Kontrola nastavenia databázy...\n', 'cyan');

  let hasErrors = false;

  // Check 1: .env file exists
  log('1. Kontrola .env súboru...', 'blue');
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    log('   ✅ .env súbor existuje', 'green');
    
    // Check if DATABASE_URL is set
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('DATABASE_URL=')) {
      log('   ✅ DATABASE_URL je nastavená', 'green');
    } else {
      log('   ❌ DATABASE_URL nie je nastavená v .env súbore', 'red');
      hasErrors = true;
    }
  } else {
    log('   ❌ .env súbor neexistuje!', 'red');
    log('      Vytvorte .env súbor skopírovaním .env.example', 'yellow');
    log('      cp .env.example .env', 'yellow');
    hasErrors = true;
  }

  // Check 2: Database connection
  log('\n2. Testovanie pripojenia k databáze...', 'blue');
  try {
    await prisma.$connect();
    log('   ✅ Pripojenie k databáze úspešné', 'green');
  } catch (error) {
    log('   ❌ Nepodarilo sa pripojiť k databáze', 'red');
    log(`      Chyba: ${error.message}`, 'red');
    log('      Skontrolujte DATABASE_URL v .env súbore', 'yellow');
    hasErrors = true;
    await prisma.$disconnect();
    process.exit(1);
  }

  // Check 3: User table exists
  log('\n3. Kontrola existencie tabuľky User...', 'blue');
  try {
    await prisma.user.findFirst();
    log('   ✅ Tabuľka User existuje', 'green');
  } catch (error) {
    log('   ❌ Tabuľka User neexistuje', 'red');
    log('      Spustite: npm run db:push', 'yellow');
    hasErrors = true;
    await prisma.$disconnect();
    process.exit(1);
  }

  // Check 4: Users in database
  log('\n4. Kontrola používateľov v databáze...', 'blue');
  try {
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      log('   ❌ Žiadni používatelia v databáze!', 'red');
      log('      Spustite: npm run db:seed', 'yellow');
      hasErrors = true;
    } else {
      log(`   ✅ Počet používateľov: ${userCount}`, 'green');
      
      // List users
      const users = await prisma.user.findMany({
        select: {
          email: true,
          name: true,
          role: true,
        },
      });
      
      log('\n   Používatelia v databáze:', 'cyan');
      users.forEach(user => {
        log(`   - ${user.name} (${user.email}) - ${user.role}`, 'cyan');
      });
    }
  } catch (error) {
    log('   ❌ Chyba pri kontrole používateľov', 'red');
    log(`      ${error.message}`, 'red');
    hasErrors = true;
  }

  // Check 5: Password hashing check (sample one user)
  log('\n5. Kontrola hashovania hesiel...', 'blue');
  try {
    const sampleUser = await prisma.user.findFirst({
      select: {
        email: true,
        password: true,
      },
    });
    
    if (sampleUser) {
      // Check if password looks like a bcrypt hash
      if (sampleUser.password.startsWith('$2a$') || sampleUser.password.startsWith('$2b$')) {
        log('   ✅ Heslá sú správne hashované', 'green');
      } else {
        log('   ❌ Heslá NIE SÚ správne hashované!', 'red');
        log('      Používatelia boli pravdepodobne vytvorení manuálne', 'yellow');
        log('      Spustite: npm run db:seed', 'yellow');
        hasErrors = true;
      }
    }
  } catch (error) {
    // Skip if no users
  }

  // Summary
  log('\n' + '='.repeat(50), 'blue');
  if (hasErrors) {
    log('❌ NAŠLI SA PROBLÉMY!', 'red');
    log('\nOdporúčané kroky:', 'yellow');
    log('1. Ak chýba .env: cp .env.example .env', 'yellow');
    log('2. Nastavte DATABASE_URL v .env súbore', 'yellow');
    log('3. Spustite: npm run db:generate', 'yellow');
    log('4. Spustite: npm run db:push', 'yellow');
    log('5. Spustite: npm run db:seed', 'yellow');
    log('6. Reštartujte aplikáciu: npm run dev', 'yellow');
    log('\nViac informácií: RIESENIE_PRIHLASENIA.md', 'cyan');
  } else {
    log('✅ VŠETKO JE V PORIADKU!', 'green');
    log('\nMôžete sa prihlásiť s jedným z týchto účtov:', 'cyan');
    log('- superadmin@local.test / superadmin123!', 'cyan');
    log('- admin@local.test / admin123!', 'cyan');
    log('- user@local.test / user123!', 'cyan');
  }
  log('='.repeat(50) + '\n', 'blue');

  await prisma.$disconnect();
  process.exit(hasErrors ? 1 : 0);
}

checkSetup().catch((error) => {
  log('\n❌ Kritická chyba pri kontrole:', 'red');
  log(error.message, 'red');
  process.exit(1);
});
