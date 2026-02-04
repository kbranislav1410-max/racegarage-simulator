# Nastavenie Produkčnej Databázy (Neon.tech)

## 🔴 Váš Problém

V databáze na neon.tech **NEMÁTE ŽIADNE TABUĽKY** a **ŽIADNE DÁTA**. Preto vám nefunguje prihlásenie - v databáze nie je tabuľka `users` ani žiadni používatelia.

## ✅ Riešenie

Musíte **PUSHNÚŤ SCHÉMU** a **SEEDOVAŤ POUŽÍVATEĽOV** do produkčnej databázy.

---

## 📋 Prečo Nemáte Tabuľky?

### Rozdiel medzi Lokálnou a Produkčnou Databázou

**Máte DVE ODDELENÉ databázy:**

1. **Lokálna databáza** (na vašom počítači)
   - DATABASE_URL v `.env` súbore
   - Pre vývoj (development)
   - Príkazy `npm run db:push` a `npm run db:seed` ovplyvňujú TÚ

2. **Produkčná databáza** (na Neon.tech)
   - DATABASE_URL v Vercel Environment Variables
   - Pre nasadenú aplikáciu (production)
   - Musí sa nastaviť SAMOSTATNE

**Keď spustíte `npm run db:push` lokálne:**
- Vytvorí tabuľky iba v LOKÁLNEJ databáze
- Produkčná databáza (Neon.tech) zostane PRÁZDNA
- Preto vo Vercel nefunguje prihlásenie

---

## 🚀 Rýchle Riešenie

### Metóda 1: Environment Variable (Odporúčaná)

**Krok 1: Získajte Connection String z Neon.tech**

1. Prejdite na: https://console.neon.tech
2. Vyberte váš projekt
3. Kliknite na "Connection Details"
4. Skopírujte connection string (pooled connection)

**Príklad:**
```
postgresql://neondb_owner:npg_n2zPtwZ8Hrdi@ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

⚠️ **DÔLEŽITÉ:** Odstráňte `&channel_binding=require` ak je prítomný!

**Krok 2: Pushnite Schému do Produkčnej Databázy**

Otvorte terminál a spustite:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_***@ep-sparkling-bush-***-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" npm run db:push
```

**Nahraďte** celý connection string vaším skutočným!

**Očakávaný výstup:**
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "neondb"

🚀  Your database is now in sync with your Prisma schema. Done in 2.50s

✔ Generated Prisma Client
```

**Krok 3: Seedujte Používateľov**

```bash
DATABASE_URL="postgresql://neondb_owner:npg_***@ep-sparkling-bush-***-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" npm run db:seed
```

**Očakávaný výstup:**
```
🌱 Starting database seed...
✅ Created SUPER_ADMIN user: superadmin@local.test
✅ Created ADMIN user: admin@local.test
✅ Created USER: user@local.test
🎉 Database seeding completed!
```

**Krok 4: Overte Nastavenie**

```bash
DATABASE_URL="postgresql://neondb_owner:npg_***@ep-sparkling-bush-***-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" npm run db:check
```

**Očakávaný výstup:**
```
🔍 Overovanie databázy...

✅ Pripojenie k databáze úspešné
✅ Databáza: neondb

📊 Nájdené tabuľky (9):
✅ users (3 rows)
✅ customers (0 rows)
✅ ride_sessions (0 rows)
✅ reservations (0 rows)
✅ payments (0 rows)
✅ vouchers (0 rows)
✅ partner_vouchers (0 rows)
✅ challenge_attempts (0 rows)
✅ newsletter_subscribers (0 rows)

👥 Používatelia v databáze:
✅ superadmin@local.test (SUPER_ADMIN)
✅ admin@local.test (ADMIN)
✅ user@local.test (USER)

✅ DATABÁZA JE SPRÁVNE NASTAVENÁ!
```

---

### Metóda 2: Dočasná Zmena .env Súboru

**⚠️ UPOZORNENIE:** Táto metóda je jednoduchšia, ale riskantnejšia (môžete omylom commitnúť produkčný DATABASE_URL).

**Krok 1: Zálohujte .env Súbor**

```bash
cp .env .env.backup
```

**Krok 2: Upravte .env Súbor**

Otvorte `.env` a **DOČASNE** zmeňte DATABASE_URL na produkčný:

```env
# PRED (lokálna databáza)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/racegarage"

# PO (produkčná databáza - Neon.tech)
DATABASE_URL="postgresql://neondb_owner:npg_***@ep-sparkling-bush-***-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**Krok 3: Pushnite Schému**

```bash
npm run db:push
```

**Krok 4: Seedujte Používateľov**

```bash
npm run db:seed
```

**Krok 5: Overte**

```bash
npm run db:check
```

**Krok 6: VRÁŤTE PÔVODNÝ .env**

```bash
cp .env.backup .env
```

alebo ručne upravte `.env` späť na lokálnu databázu.

⚠️ **DÔLEŽITÉ:** NIKDY NEcommitujte produkčný DATABASE_URL do gitu!

---

## ✅ Overenie v Neon.tech Dashboard

**Krok 1: Prejdite na Neon.tech**

https://console.neon.tech

**Krok 2: Vyberte Projekt**

Kliknite na váš projekt (skontrolujte, že host v connection stringu sa zhoduje).

**Krok 3: Prejdite na Tables**

V ľavom menu kliknite na **"Tables"**

**Čo by ste mali vidieť:**

```
📊 Tables (9):
  ✅ users
  ✅ customers
  ✅ ride_sessions
  ✅ reservations
  ✅ payments
  ✅ vouchers
  ✅ partner_vouchers
  ✅ challenge_attempts
  ✅ newsletter_subscribers
```

**Krok 4: Overte Používateľov**

Kliknite na **"SQL Editor"** a spustite:

```sql
SELECT * FROM users;
```

**Mali by ste vidieť 3 používateľov:**
- superadmin@local.test (SUPER_ADMIN)
- admin@local.test (ADMIN)
- user@local.test (USER)

---

## 🧪 Test Prihlásenia na Vercel

**Krok 1: Prejdite na Nasadenú Aplikáciu**

Otvorte váš Vercel URL, napr.:
```
https://racegarage-simulator-xyz.vercel.app/login
```

**Krok 2: Prihláste Sa**

```
Email: superadmin@local.test
Heslo: superadmin123!
```

**Krok 3: Malo by Fungovať!** ✅

Ak sa úspešne prihlásite, databáza je správne nastavená!

---

## 🔧 Riešenie Problémov

### Problém 1: "Connection failed" alebo "Connection timeout"

**Príčina:** Nesprávny connection string alebo sieťový problém.

**Riešenie:**
1. Skopírujte **fresh** connection string z Neon.tech dashboard
2. Použite **pooled connection** (má `-pooler` v URL)
3. Odstráňte `&channel_binding=require` parameter
4. Formát: `postgresql://...?sslmode=require`

### Problém 2: "Table 'users' already exists"

**Príčina:** Schéma už bola pushnuta.

**Riešenie:**
- To je OK! Preskočte `db:push`
- Spustite iba `db:seed` na pridanie používateľov

### Problém 3: "Seed failed" alebo "No users created"

**Príčina:** Schéma nebola ešte pushnuta.

**Riešenie:**
1. Najprv spustite `db:push`
2. Potom spustite `db:seed`

### Problém 4: "Wrong DATABASE_URL"

**Príčina:** Pripájate sa k nesprávnej databáze.

**Riešenie:**
1. Overte, že host v connection stringu sa zhoduje s Neon.tech projektom
2. Skontrolujte názov databázy (zvyčajne `neondb`)
3. Overte, že používate connection string z Vercel Environment Variables

### Problém 5: Stále "Internal Server Error" na prihlásení

**Príčina:** Vercel nevidí nové dáta alebo má starú Prisma Client cache.

**Riešenie:**
1. Redeploy aplikáciu vo Vercel (kliknite "Redeploy")
2. Počkajte 2-3 minúty na dokončenie
3. Vymažte cache v prehliadači (Ctrl+Shift+R alebo Cmd+Shift+R)
4. Skúste sa prihlásiť znova

---

## ⚠️ Bezpečnostné Upozornenia

### ❌ NIKDY NEROBTE:

1. **Necommitujte produkčný DATABASE_URL do gitu**
   - `.env` súbor je v `.gitignore`
   - Ale buďte opatrní pri editovaní

2. **Nemažte produkčnú databázu**
   - Príkaz `db:push` je bezpečný (nevymaže dáta)
   - Ale `prisma migrate reset` VYMAŽE VŠETKO!

3. **Nespúšťajte lokálne príkazy na produkčnej databáze náhodou**
   - Vždy overte, ktorú DATABASE_URL používate
   - Používajte environment variable metódu pre jasnosť

### ✅ Dobré Praktiky:

1. **Vždy zálohujte .env pred zmenou**
   ```bash
   cp .env .env.backup
   ```

2. **Overte DATABASE_URL pred spustením príkazov**
   ```bash
   echo $DATABASE_URL  # Linux/Mac
   echo %DATABASE_URL%  # Windows
   ```

3. **Používajte environment variable metódu**
   - Bezpečnejšia (nemeníte .env súbor)
   - Jasnejšia (vidíte, že pracujete s produkciou)

---

## 📚 Zhrnutie Príkazov

### Pre Produkčnú Databázu (Neon.tech):

```bash
# Náhrada [YOUR_PRODUCTION_URL] vašim connection stringom

# 1. Vytvoriť tabuľky
DATABASE_URL="[YOUR_PRODUCTION_URL]" npm run db:push

# 2. Pridať používateľov
DATABASE_URL="[YOUR_PRODUCTION_URL]" npm run db:seed

# 3. Overiť nastavenie
DATABASE_URL="[YOUR_PRODUCTION_URL]" npm run db:check
```

### Pre Lokálnu Databázu:

```bash
# Používa DATABASE_URL z .env súboru

npm run db:push      # Vytvoriť tabuľky
npm run db:seed      # Pridať používateľov
npm run db:check     # Overiť nastavenie
```

---

## 🎯 Checklist Po Nastavení

- [ ] Spustený `db:push` s produkčným DATABASE_URL
- [ ] Spustený `db:seed` s produkčným DATABASE_URL
- [ ] V Neon.tech dashboard vidím 9 tabuliek
- [ ] V tabuľke `users` sú 3 používatelia
- [ ] Redeployed aplikácia vo Vercel
- [ ] Vymazaná cache v prehliadači
- [ ] Test prihlásenia funguje ✅

---

## ❓ FAQ

### Q: Musím to robiť zakaždým, keď nasadím?

**A:** Nie! Stačí raz. Tabuľky a používatelia zostanú v databáze. Potrebujete to urobiť iba pri prvom nastavení alebo pri zmene schémy.

### Q: Čo keď zmením Prisma schému?

**A:** Budete musieť spustiť `db:push` znova (s produkčným DATABASE_URL), aby sa zmeny prejavili v produkcii.

### Q: Môžem použiť Prisma Studio na produkčnú databázu?

**A:** Áno! Spustite:
```bash
DATABASE_URL="[YOUR_PRODUCTION_URL]" npx prisma studio
```

Otvorí sa UI, kde môžete vidieť a upraviť dáta v produkčnej databáze.

### Q: Ako viem, či som pripojený k správnej databáze?

**A:** Skontrolujte host v connection stringu:
- Musí sa zhodovať s projektom v Neon.tech dashboard
- Pooled connection má `-pooler` v URL

### Q: Môžem manuálne pridať používateľov cez SQL?

**A:** Áno, ale heslo musí byť **bcrypt hash**. Príklad:

```sql
-- Generujte bcrypt hash pomocou online nástroja alebo Node.js
INSERT INTO users (email, name, role, password) VALUES
('admin@example.com', 'Admin User', 'ADMIN', '$2a$10$...');
```

Jednoduchšie je použiť `npm run db:seed`.

---

## 🔗 Súvisiace Dokumenty

- `INSTALACIA.md` - Kompletný inštalačný návod
- `VERCEL_ENV_SETUP.md` - Nastavenie environment variables vo Vercel
- `OVERENIE_DATABAZY.md` - Overenie stavu databázy
- `INTERNAL_SERVER_ERROR.md` - Riešenie Internal Server Error

---

## ✅ Výsledok

Po dokončení týchto krokov:

✅ Produkčná databáza bude mať **9 tabuliek**  
✅ Tabuľka `users` bude mať **3 používateľov**  
✅ Prihlásenie vo Vercel aplikácii **bude fungovať**  
✅ Nebudete už vidieť **Internal Server Error**  

**Gratulujeme! Vaša produkčná databáza je teraz správne nastavená!** 🎉

---

**Posledná aktualizácia:** 2026-02-04
