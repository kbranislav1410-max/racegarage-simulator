const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkDatabase() {
  console.log('🔍 Overovanie databázy...\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Pripojenie k databáze úspešné');
    
    // Get database info
    const dbUrl = process.env.DATABASE_URL || '';
    const dbMatch = dbUrl.match(/\/([^?]+)/);
    const dbName = dbMatch ? dbMatch[1] : 'unknown';
    const hostMatch = dbUrl.match(/@([^/]+)/);
    const host = hostMatch ? hostMatch[1] : 'unknown';
    
    console.log(`✅ Databáza: ${dbName}`);
    console.log(`✅ Host: ${host}\n`);

    // Get all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log('❌ V databáze nie sú žiadne tabuľky!\n');
      console.log('Spustite tieto príkazy:');
      console.log('1. npm run db:push');
      console.log('2. npm run db:seed');
      console.log('3. npm run db:check\n');
      process.exit(1);
    }

    console.log(`📊 Nájdené tabuľky (${tables.length}):`);

    // Check each table for row count
    for (const table of tables) {
      const tableName = table.table_name;
      try {
        const count = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "${tableName}"`
        );
        const rowCount = count[0].count;
        console.log(`   ✅ ${tableName} (${rowCount} rows)`);
      } catch (error) {
        console.log(`   ⚠️  ${tableName} (nepodarilo sa spočítať riadky)`);
      }
    }

    // Check users specifically
    console.log('\n👥 Používatelia v databáze:');
    try {
      const users = await prisma.user.findMany({
        select: {
          email: true,
          name: true,
          role: true,
        },
      });

      if (users.length === 0) {
        console.log('   ❌ Žiadni používatelia v databáze!');
        console.log('   Spustite: npm run db:seed\n');
      } else {
        users.forEach(user => {
          console.log(`   ✅ ${user.email} (${user.role})`);
        });
      }
    } catch (error) {
      console.log('   ⚠️  Nepodarilo sa načítať používateľov');
    }

    console.log('\n✅ DATABÁZA JE SPRÁVNE NASTAVENÁ!');
    console.log('\nMôžete pokračovať s používaním aplikácie.');
    console.log('Pre prihlásenie použite:');
    console.log('  Email: superadmin@local.test');
    console.log('  Heslo: superadmin123!\n');

  } catch (error) {
    console.error('❌ Chyba pri pripojení k databáze!\n');
    console.error('Chybová správa:', error.message);
    
    if (error.message.includes('DATABASE_URL')) {
      console.log('\n💡 DATABASE_URL nie je nastavená!');
      console.log('Vytvorte súbor .env a pridajte:');
      console.log('DATABASE_URL="postgresql://..."');
    } else if (error.message.includes('ECONNREFUSED') || error.message.includes('Connection')) {
      console.log('\n💡 Nepodarilo sa pripojiť k databáze.');
      console.log('Skontrolujte, či je DATABASE_URL správne nastavená.');
      console.log('Odstráňte parameter &channel_binding=require');
    }
    
    console.log('\nPrečítajte si: OVERENIE_DATABAZY.md\n');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

checkDatabase();
