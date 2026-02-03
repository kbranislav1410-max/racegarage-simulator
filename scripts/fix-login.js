#!/usr/bin/env node

/**
 * Automated Fix Script for Login Issues
 * This script will fix common login problems by:
 * 1. Creating .env file if missing
 * 2. Checking database connection
 * 3. Removing manually created users
 * 4. Running seed to create users with proper password hashing
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logBold(message, color = 'reset') {
  console.log(colors.bold + colors[color] + message + colors.reset);
}

async function fixLogin() {
  logBold('\n🔧 AUTOMATICKÁ OPRAVA PRIHLÁSENIA\n', 'cyan');
  log('='.repeat(60), 'blue');

  let needsRestart = false;

  // Step 1: Check .env file
  logBold('\n1️⃣  Kontrola .env súboru...', 'blue');
  const envPath = path.join(process.cwd(), '.env');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (!fs.existsSync(envPath)) {
    log('   ❌ .env súbor chýba!', 'red');
    
    if (fs.existsSync(envExamplePath)) {
      log('   📝 Vytváram .env zo .env.example...', 'yellow');
      fs.copyFileSync(envExamplePath, envPath);
      log('   ✅ .env súbor vytvorený!', 'green');
      log('   ⚠️  DÔLEŽITÉ: Upravte DATABASE_URL v .env súbore!', 'yellow');
      log('   Príklad: DATABASE_URL="******localhost:5432/racegarage_simulator"', 'cyan');
      
      // Check if DATABASE_URL looks like default
      const envContent = fs.readFileSync(envPath, 'utf-8');
      if (envContent.includes('localhost:5432/racegarage?')) {
        log('\n   ⚠️  POZOR: DATABASE_URL obsahuje predvolenú hodnotu!', 'red');
        log('   Otvorte .env súbor a zmeňte názov databázy na správny.', 'yellow');
        log('   Potom spustite tento skript znova.', 'yellow');
        process.exit(1);
      }
      
      needsRestart = true;
    } else {
      log('   ❌ .env.example súbor neexistuje!', 'red');
      process.exit(1);
    }
  } else {
    log('   ✅ .env súbor existuje', 'green');
  }

  // Step 2: Check database connection
  logBold('\n2️⃣  Testovanie pripojenia k databáze...', 'blue');
  try {
    await prisma.$connect();
    log('   ✅ Pripojenie k databáze úspešné', 'green');
  } catch (error) {
    log('   ❌ Nepodarilo sa pripojiť k databáze!', 'red');
    log(`   Chyba: ${error.message}`, 'red');
    log('\n   🔍 Možné príčiny:', 'yellow');
    log('   1. PostgreSQL nebeží', 'yellow');
    log('   2. Nesprávna DATABASE_URL v .env súbore', 'yellow');
    log('   3. Databáza neexistuje', 'yellow');
    log('\n   📝 Skontrolujte DATABASE_URL v .env súbore', 'cyan');
    await prisma.$disconnect();
    process.exit(1);
  }

  // Step 3: Check if User table exists
  logBold('\n3️⃣  Kontrola databázových tabuliek...', 'blue');
  try {
    await prisma.user.findFirst();
    log('   ✅ Tabuľka User existuje', 'green');
  } catch (error) {
    log('   ❌ Tabuľka User neexistuje!', 'red');
    log('   📝 Vytváram tabuľky...', 'yellow');
    
    try {
      execSync('npm run db:push', { stdio: 'inherit' });
      log('   ✅ Tabuľky vytvorené', 'green');
    } catch (error) {
      log('   ❌ Zlyhalo vytváranie tabuliek', 'red');
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  // Step 4: Check existing users
  logBold('\n4️⃣  Kontrola existujúcich používateľov...', 'blue');
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    if (users.length === 0) {
      log('   ℹ️  Žiadni používatelia v databáze', 'cyan');
    } else {
      log(`   📊 Nájdených používateľov: ${users.length}`, 'cyan');
      
      // Check if passwords are properly hashed
      let hasInvalidPasswords = false;
      users.forEach(user => {
        const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
        if (!isHashed) {
          log(`   ❌ ${user.email} - Heslo NIE JE hashované!`, 'red');
          hasInvalidPasswords = true;
        } else {
          log(`   ✅ ${user.email} - ${user.role}`, 'green');
        }
      });

      if (hasInvalidPasswords) {
        log('\n   🔧 Zistené nesprávne hashované heslá!', 'yellow');
        log('   🗑️  Mažem všetkých používateľov...', 'yellow');
        
        await prisma.user.deleteMany({});
        log('   ✅ Používatelia vymazaní', 'green');
      } else if (users.length >= 3) {
        // Check if we have the expected test accounts
        const hasExpectedUsers = users.some(u => u.email === 'superadmin@local.test') &&
                                 users.some(u => u.email === 'admin@local.test') &&
                                 users.some(u => u.email === 'user@local.test');
        
        if (hasExpectedUsers) {
          log('\n   ✅ Všetci testovacie používatelia existujú a sú správne!', 'green');
          log('   ℹ️  Seed nie je potrebný', 'cyan');
          
          await prisma.$disconnect();
          
          logBold('\n🎉 HOTOVO!', 'green');
          log('='.repeat(60), 'blue');
          log('\n✅ Prihlásenie by malo fungovať!', 'green');
          log('\nTestovacie účty:', 'cyan');
          log('  • superadmin@local.test / superadmin123!', 'cyan');
          log('  • admin@local.test / admin123!', 'cyan');
          log('  • user@local.test / user123!', 'cyan');
          
          if (needsRestart) {
            log('\n⚠️  DÔLEŽITÉ: Reštartujte aplikáciu!', 'yellow');
            log('   Zastavte npm run dev (Ctrl+C) a spustite znova.', 'yellow');
          }
          
          return;
        }
      }
    }
  } catch (error) {
    log('   ❌ Chyba pri kontrole používateľov', 'red');
    log(`   ${error.message}`, 'red');
  }

  // Step 5: Run seed
  logBold('\n5️⃣  Vytváram používateľov so správnymi heslami...', 'blue');
  try {
    log('   📝 Spúšťam seed skript...', 'yellow');
    execSync('npm run db:seed', { stdio: 'inherit' });
    log('   ✅ Používatelia vytvorení!', 'green');
    needsRestart = true;
  } catch (error) {
    log('   ❌ Zlyhalo vytvorenie používateľov', 'red');
    await prisma.$disconnect();
    process.exit(1);
  }

  // Step 6: Verify
  logBold('\n6️⃣  Overenie...', 'blue');
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
      },
    });

    log(`   ✅ Vytvorených používateľov: ${users.length}`, 'green');
    users.forEach(user => {
      log(`   ✓ ${user.name} (${user.email}) - ${user.role}`, 'cyan');
    });
  } catch (error) {
    log('   ❌ Chyba pri overení', 'red');
  }

  await prisma.$disconnect();

  // Final summary
  logBold('\n🎉 HOTOVO!', 'green');
  log('='.repeat(60), 'blue');
  
  log('\n✅ Prihlásenie bolo opravené!', 'green');
  log('\nTestovacie účty:', 'cyan');
  log('  • superadmin@local.test / superadmin123!', 'cyan');
  log('  • admin@local.test / admin123!', 'cyan');
  log('  • user@local.test / user123!', 'cyan');

  if (needsRestart) {
    log('\n⚠️  DÔLEŽITÉ: Reštartujte aplikáciu!', 'yellow');
    log('   1. Zastavte npm run dev (stlačte Ctrl+C)', 'yellow');
    log('   2. Spustite znova: npm run dev', 'yellow');
    log('   3. Vyčistite cache prehliadača (F12 → Application → Local Storage → Clear)', 'yellow');
  }

  log('\n📖 Pre viac informácií: VASHE_RIESENIE.md', 'cyan');
  log('='.repeat(60) + '\n', 'blue');
}

fixLogin().catch((error) => {
  log('\n❌ KRITICKÁ CHYBA:', 'red');
  console.error(error);
  process.exit(1);
});
