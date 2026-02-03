# Riešenie Vášho Problému s Prihlásením

## Čo sa stalo?

Zistili ste, že:
1. ❌ Prihlasovacia stránka sa zobrazuje, ale prihlásenie nefunguje
2. ❌ V databáze (Prisma Studio) ste videli prázdnu tabuľku `users`
3. ❌ Aj keď ste pridali používateľa manuálne, stále to nefunguje

## Prečo to nefunguje?

### Hlavný problém: Chýba `.env` súbor alebo neboli vytvorení používatelia

Aplikácia potrebuje:
1. **Súbor `.env`** s nastavením databázy (`DATABASE_URL`)
2. **Inicializovanú databázu** (vytvorené tabuľky)
3. **Používateľov s hashovanými heslami** (vytvorených cez `npm run db:seed`)

### Prečo manuálne pridaný používateľ nefunguje?

Keď ste pridali používateľa v Prisma Studio, zadali ste heslo ako obyčajný text (napr. "password123"). Ale aplikácia očakáva **hashované heslo** pomocou bcrypt (vyzerá ako `$2a$10$...`).

Pri prihlásení aplikácia:
1. Vezme vaše zadané heslo
2. Porovná ho s hashom v databáze pomocou bcrypt
3. Ak hash nezodpovedá, prihlásenie zlyhá

**Riešenie:** Nikdy nepridávajte používateľov manuálne! Použite `npm run db:seed`.

## 🎯 Riešenie Krok za Krokom

### Možnosť A: Automatická Diagnostika (Odporúčané)

```bash
# 1. Prejdite do priečinka projektu
cd racegarage-simulator

# 2. Spustite diagnostický nástroj
npm run check-setup
```

Nástroj vám povie presne, čo je potrebné opraviť!

### Možnosť B: Manuálne Kroky

#### 1. Skontrolujte `.env` súbor

```bash
# Skontrolujte, či existuje
ls -la .env
```

**Ak neexistuje:**
```bash
# Na Mac/Linux:
cp .env.example .env

# Na Windows PowerShell:
Copy-Item .env.example .env
```

#### 2. Nastavte DATABASE_URL

Otvorte `.env` v textovom editore a upravte:

```env
DATABASE_URL="postgresql://postgres:vase_heslo@localhost:5432/racegarage_simulator"
```

**Dôležité:** Nahraďte `vase_heslo` skutočným heslom k vašej PostgreSQL databáze!

**Pre Docker:**
```env
DATABASE_URL="postgresql://simulator:simulator@localhost:5432/simulator"
```

#### 3. Inicializujte Databázu

```bash
# Vygenerujte Prisma Client
npm run db:generate

# Vytvorte tabuľky
npm run db:push
```

#### 4. Vytvorte Používateľov

```bash
npm run db:seed
```

**Mali by ste vidieť:**
```
🌱 Starting database seed...
✅ Created SUPER_ADMIN user: superadmin@local.test
✅ Created ADMIN user: admin@local.test
✅ Created USER: user@local.test
🎉 Database seeding completed!
```

#### 5. Vymažte Manuálne Pridaných Používateľov

Ak ste predtým pridali používateľov manuálne v Prisma Studio:

1. Otvorte Prisma Studio: `npx prisma studio`
2. Prejdite na tabuľku `User`
3. Vymažte všetkých manuálne pridaných používateľov
4. Spustite znova: `npm run db:seed`

#### 6. Reštartujte Aplikáciu

```bash
# Zastavte aplikáciu (Ctrl+C v termináli kde beží npm run dev)
npm run dev
```

#### 7. Vyčistite Cache Prehliadača

1. Otvorte DevTools (stlačte F12)
2. Prejdite na záložku **Application**
3. V ľavom paneli kliknite na **Local Storage** → `http://localhost:3000`
4. Kliknite pravým tlačidlom a vyberte **Clear**
5. Obnovte stránku (F5)

#### 8. Prihláste Sa

Otvorte `http://localhost:3000` a prihláste sa jedným z týchto účtov:

| Rola | Email | Heslo | Oprávnenia |
|------|-------|-------|------------|
| Super Admin | superadmin@local.test | superadmin123! | Všetko |
| Admin | admin@local.test | admin123! | Všetko okrem mazania |
| User | user@local.test | user123! | Základné, bez financií |

## ✅ Overenie Úspechu

Spustite diagnostický nástroj:

```bash
npm run check-setup
```

**Úspech = vidíte:**
```
✅ VŠETKO JE V PORIADKU!

Môžete sa prihlásiť s jedným z týchto účtov:
- superadmin@local.test / superadmin123!
- admin@local.test / admin123!
- user@local.test / user123!
```

## 🔍 Ďalšie Kontroly

### Skontrolujte Používateľov v Databáze

```bash
npx prisma studio
```

V tabuľke `User` by ste mali vidieť 3 používateľov:
- Super Administrator (SUPER_ADMIN)
- Administrator (ADMIN)
- Regular User (USER)

**Dôležité:** Políčko `password` musí obsahovať hash začínajúci s `$2a$10$` alebo `$2b$10$`!

### Skontrolujte Logy Aplikácie

Keď spustíte `npm run dev`, sledujte výstup v termináli. Pri pokuse o prihlásenie by ste nemali vidieť žiadne chyby.

### Skontrolujte Browser Console

1. Otvorte DevTools (F12)
2. Prejdite na záložku **Console**
3. Pokúste sa prihlásiť
4. Ak sú chyby, zapíšte si ich

## 🆘 Ak Stále Nefunguje

### 1. Skontrolujte PostgreSQL

```bash
# Pre Docker:
docker ps
# Mali by ste vidieť postgres kontajner

# Pre lokálny PostgreSQL:
psql -h localhost -U postgres -d racegarage_simulator
# Ak sa pripojíte, PostgreSQL beží
```

### 2. Skontrolujte Pripojenie k Databáze

```bash
# Otvorte Node.js konzolu
node

# Spustite:
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
prisma.$connect().then(() => console.log('Pripojené!')).catch(e => console.error(e))
```

### 3. Pošlite Diagnostiku

```bash
# Spustite diagnostiku a uložte výstup
npm run check-setup > diagnostika.txt 2>&1
```

Pošlite súbor `diagnostika.txt` spolu s otázkou.

## 📚 Ďalšie Dokumenty

Ak potrebujete viac informácií:

1. **[RYCHLE_RIESENIE.md](./RYCHLE_RIESENIE.md)** - Rýchle 5-krokové riešenie (skrátená verzia)
2. **[RIESENIE_PRIHLASENIA.md](./RIESENIE_PRIHLASENIA.md)** - Kompletný troubleshooting manual
3. **[INSTALACIA.md](./INSTALACIA.md)** - Úplný inštalačný návod od začiatku
4. **[ZHRNUTIE_IMPLEMENTACIE.md](./ZHRNUTIE_IMPLEMENTACIE.md)** - Technické detaily implementácie

## 💡 Tipy Pre Budúcnosť

1. ✅ Vždy používajte `npm run db:seed` na vytvorenie používateľov
2. ✅ Nikdy nepridávajte používateľov manuálne cez Prisma Studio
3. ✅ Skontrolujte `.env` súbor pred spustením aplikácie
4. ✅ Použite `npm run check-setup` pri akýchkoľvek problémoch
5. ✅ Vyčistite cache prehliadača po zmenách v databáze

## 🎯 Zhrnutie

**Problém:** Prázdna tabuľka users + nefunkčné prihlásenie

**Príčina:** Chýbajúci .env súbor alebo nespustený seed script

**Riešenie:**
```bash
# Rýchle riešenie v jednom príkaze:
cp .env.example .env && npm run db:generate && npm run db:push && npm run db:seed && npm run dev

# Ale najprv upravte DATABASE_URL v .env!
```

**Overenie:**
```bash
npm run check-setup
```

Teraz by malo všetko fungovať! 🎉
