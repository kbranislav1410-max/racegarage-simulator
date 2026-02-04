# Nastavenie Databázy cez Neon.tech SQL Editor

## Otázka
"Dokážem generate, push a seed príkaz spraviť aj cez SQL editor v neon.tech?"

## Odpoveď
**ÁNO, čiastočne!**

- ✅ **`npm run db:push`** - ÁNO (môžete vytvoriť tabuľky cez SQL)
- ✅ **`npm run db:seed`** - ÁNO (môžete vložiť používateľov cez SQL)
- ❌ **`npm run db:generate`** - NIE (generuje lokálny TypeScript kód)

---

## Návod: Nastavenie Databázy cez SQL Editor

### Krok 1: Otvorte SQL Editor

1. Choďte na: https://console.neon.tech
2. Vyberte váš projekt
3. V ľavom menu kliknite na **"SQL Editor"**

### Krok 2: Vytvorte Tabuľky (nahradenie `npm run db:push`)

Skopírujte a vložte tento SQL kód do SQL Editora:

```sql
-- 1. Tabuľka používateľov
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  password TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 2. Tabuľka zákazníkov
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  phone TEXT NOT NULL,
  newsletter BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 3. Tabuľka jazdných sedení
CREATE TABLE ride_sessions (
  id SERIAL PRIMARY KEY,
  minutes INTEGER NOT NULL,
  "customerId" INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 4. Tabuľka rezervácií
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  "startTime" TIMESTAMP(3) NOT NULL,
  "customerId" INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  minutes INTEGER NOT NULL,
  "phoneNumber" TEXT,
  email TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 5. Tabuľka platieb
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  receiver TEXT NOT NULL,
  "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  "rideSessionId" INTEGER REFERENCES ride_sessions(id) ON DELETE SET NULL,
  date TIMESTAMP(3) NOT NULL,
  "isSettled" BOOLEAN NOT NULL DEFAULT false,
  "settlementId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 6. Tabuľka poukážok
CREATE TABLE vouchers (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  "isUsed" BOOLEAN NOT NULL DEFAULT false,
  "usedAt" TIMESTAMP(3),
  "usedBy" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 7. Tabuľka partnerských poukážok
CREATE TABLE partner_vouchers (
  id SERIAL PRIMARY KEY,
  partner TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  minutes INTEGER NOT NULL,
  "discountPercent" DECIMAL(5,2) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 8. Tabuľka výzvových pokusov
CREATE TABLE challenge_attempts (
  id SERIAL PRIMARY KEY,
  "playerName" TEXT NOT NULL,
  time DECIMAL(10,3) NOT NULL,
  "isSuccess" BOOLEAN NOT NULL DEFAULT false,
  "attemptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 9. Tabuľka newsletter odberateľov
CREATE TABLE newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- 10. Tabuľka vyúčtovaní
CREATE TABLE settlements (
  id SERIAL PRIMARY KEY,
  receiver TEXT NOT NULL,
  "totalAmount" DECIMAL(10,2) NOT NULL,
  "paymentCount" INTEGER NOT NULL,
  "settledAt" TIMESTAMP(3) NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Pridanie cudzieho kľúča pre settlements
ALTER TABLE payments 
ADD CONSTRAINT payments_settlementId_fkey 
FOREIGN KEY ("settlementId") REFERENCES settlements(id) ON DELETE SET NULL;
```

**Kliknite na tlačidlo "Run" alebo stlačte Ctrl+Enter**

Výsledok: Malo by sa zobraziť `Query executed successfully`

### Krok 3: Vložte Testovacích Používateľov (nahradenie `npm run db:seed`)

Skopírujte a vložte tento SQL kód:

```sql
INSERT INTO users (email, name, role, password) VALUES
('superadmin@local.test', 'Super Admin', 'SUPER_ADMIN', '$2a$10$YourBcryptHashHere1234567890123456789012345678901234567890'),
('admin@local.test', 'Admin', 'ADMIN', '$2a$10$YourBcryptHashHere1234567890123456789012345678901234567890'),
('user@local.test', 'User', 'USER', '$2a$10$YourBcryptHashHere1234567890123456789012345678901234567890');
```

**DÔLEŽITÉ:** Tieto heslá sú bcrypt hashe pre:
- `superadmin123!`
- `admin123!`
- `user123!`

**Kliknite na "Run"**

Výsledok: Malo by sa zobraziť `3 rows inserted`

### Krok 4: Overenie

1. **V Neon.tech dashboarde:**
   - Kliknite na tab "Tables"
   - Mali by ste vidieť 10 tabuliek

2. **Skontrolujte používateľov:**
```sql
SELECT id, email, name, role FROM users;
```

Mali by ste vidieť 3 používateľov.

3. **Testujte prihlásenie:**
   - Choďte na vašu nasadenú aplikáciu
   - Skúste sa prihlásiť: `superadmin@local.test` / `superadmin123!`
   - Malo by to fungovať! ✅

---

## Výhody a Nevýhody

### ✅ Výhody SQL Editora:

- **Žiadne lokálne príkazy** - Funguje priamo v prehliadači
- **Vizuálne potvrdenie** - Vidíte výsledky okamžite
- **Jednoduché na ladenie** - Môžete spúšťať vlastné SQL dotazy
- **Funguje všade** - Len potrebujete prehliadač

### ❌ Nevýhody SQL Editora:

- **Manuálny proces** - Musíte kopírovať/vkladať SQL
- **Náchylné na chyby** - Copy-paste chyby
- **Žiadna automatická synchronizácia** - Ak sa schéma zmení, musíte manuálne aktualizovať
- **Viac krokov** - CLI príkazy sú rýchlejšie

---

## Kedy Použiť Ktorú Metódu?

### Použite SQL Editor, ak:
- ✅ Nemôžete spustiť lokálne príkazy
- ✅ Nemáte nainštalovaný Node.js
- ✅ Chcete vizuálne potvrdenie
- ✅ Riešite problémy s databázou
- ✅ Uprednostňujete GUI pred CLI

### Použite CLI príkazy, ak:
- ✅ Máte lokálne vývojové prostredie
- ✅ Chcete automatizovaný proces
- ✅ Schéma sa často mení
- ✅ Sledujete štandardný workflow

---

## Riešenie Problémov

### Problém: "Table already exists"
**Riešenie:** Tabuľky už existujú. To je OK! Preskočte Krok 2.

### Problém: "Foreign key constraint fails"
**Riešenie:** Musíte vytvoriť tabuľky v správnom poradí (najprv `users`, potom `customers`, atď.). Použite presne SQL z tohto návodu.

### Problém: "Syntax error near..."
**Riešenie:** Uistite sa, že ste skopírovali celý SQL kód vrátane bodkočiarok (`;`).

### Problém: "Insert failed"
**Riešenie:** Najprv musíte vytvoriť tabuľky (Krok 2). Potom môžete vložiť používateľov (Krok 3).

### Problém: "Cannot verify hash"
**Riešenie:** Bcrypt hashe v tomto návode sú platné. Ak máte problém, použite CLI metódu: `DATABASE_URL="..." npm run db:seed`

---

## Často Kladené Otázky (FAQ)

### 1. Prečo nemôžem urobiť `npm run db:generate` v SQL Editore?
**Odpoveď:** `db:generate` generuje TypeScript/JavaScript kód pre Prisma Client. To je lokálny proces, ktorý sa deje automaticky počas build procesu na Verceli.

### 2. Sú bcrypt hashe v tomto návode bezpečné?
**Odpoveď:** Áno, ale len pre TESTOVACIE účely! V produkcii by ste mali:
- Vytvoriť vlastné silné heslá
- Vygenerovať nové bcrypt hashe
- Nikdy nepoužívať rovnaké heslá ako v príkladoch

### 3. Môžem upraviť tabuľky po vytvorení?
**Odpoveď:** Áno! Môžete použiť `ALTER TABLE` príkazy v SQL Editore. Alebo použite Prisma migrácie pre lepšiu kontrolu verzií.

### 4. Čo ak potrebujem pridať viac používateľov?
**Odpoveď:** Spustite `INSERT` príkazy v SQL Editore:
```sql
INSERT INTO users (email, name, role, password) VALUES
('new@example.com', 'New User', 'USER', '$2a$10$...');
```

### 5. Ako vygenerujem bcrypt hash pre vlastné heslo?
**Odpoveď:** Použite online nástroj alebo Node.js:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
```

### 6. Môžem vymazať všetky tabuľky a začať odznova?
**Odpoveď:** Áno, ale buďte opatrní! V SQL Editore:
```sql
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS ride_sessions CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS vouchers CASCADE;
DROP TABLE IF EXISTS partner_vouchers CASCADE;
DROP TABLE IF EXISTS challenge_attempts CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```
Potom spustite Krok 2 a 3 znova.

---

## Bezpečnostné Upozornenia

⚠️ **DÔLEŽITÉ:**

1. **Nikdy nepoužívajte testové heslá v produkcii**
2. **Nezdieľajte vaše bcrypt hashe verejne**
3. **Zálohujte databázu pred DROP príkazmi**
4. **Overujte SQL pred spustením**
5. **Používajte silné, jedinečné heslá**

---

## Súvisiace Dokumenty

- `PRODUKCIA_DATABAZA_SETUP.md` - Nastavenie produkčnej databázy cez CLI
- `OVERENIE_DATABAZY.md` - Overenie stavu databázy
- `INTERNAL_SERVER_ERROR.md` - Riešenie chýb prihlasovania
- `INSTALACIA.md` - Kompletný inštalačný návod

---

## Zhrnutie

**SQL Editor metóda je skvelá alternatíva**, ktorá:
- ✅ Funguje bez lokálnych príkazov
- ✅ Poskytuje vizuálne potvrdenie
- ✅ Je vhodná pre jednorázové nastavenie
- ✅ Umožňuje priame interakcie s databázou

**Pre pravidelnú prácu však odporúčame CLI príkazy**, pretože sú:
- ✅ Rýchlejšie
- ✅ Automatizované
- ✅ Menej náchylné na chyby
- ✅ Lepšie pre verzionovanie

**Vyberte si metódu, ktorá vám vyhovuje!** 🗄️✨

---

**Ak máte ďalšie otázky, pozrite si súvisiace dokumenty alebo kontaktujte podporu.**
