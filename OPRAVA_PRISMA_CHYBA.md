# 🔧 OPRAVA: PrismaClientInitializationError

## Problém Bol Vyriešený! ✅

### Čo Bolo Zlé?

Keď ste spúšťali `npm run check-setup`, dostávali ste túto chybu:

```
PrismaClientInitializationError: `PrismaClient` needs to be constructed 
with a non-empty, valid `PrismaClientOptions`
```

**Príčina:** Aplikácia používa Prisma 7.x, ktorá vyžaduje špeciálny PostgreSQL adapter. Diagnostické skripty (check-setup.js a fix-login.js) používali starý spôsob inicializácie, ktorý nefungoval s Prisma 7.x.

### Čo Bolo Opravené?

Upravil som oba skripty, aby správne inicializovali Prisma Client s PostgreSQL adapterom:

- ✅ `scripts/check-setup.js` - teraz používa adapter
- ✅ `scripts/fix-login.js` - teraz používa adapter

---

## 🚀 Čo Máte Teraz Urobiť

### Krok 1: Stiahnite Opravu

```bash
git pull origin copilot/add-user-roles-superadmin-admin-user
```

### Krok 2: Spustite Diagnostiku

Teraz by malo fungovať bez chyby:

```bash
npm run check-setup
```

**Očakávaný výstup:** Mali by ste vidieť farebnú diagnostiku (zelené ✅ alebo červené ❌)

### Krok 3: Ak Diagnostika Našla Problémy

Ak check-setup ukáže problémy, spustite automatickú opravu:

```bash
npm run fix-login
```

### Krok 4: Reštartujte Aplikáciu

```bash
# Zastavte npm run dev (Ctrl+C)
npm run dev
```

### Krok 5: Vyčistite Cache a Prihláste Sa

1. Otvorte `http://localhost:3000`
2. Stlačte **F12** (DevTools)
3. Application → Local Storage → Clear
4. Obnovte stránku (F5)
5. Prihláste sa:
   ```
   Email: superadmin@local.test
   Heslo: superadmin123!
   ```

---

## 📊 Čo Očakávať Po Oprave

### Ak `npm run check-setup` Ukáže:

#### ✅ Všetko OK:
```
🔍 Kontrola nastavenia databázy...

1. Kontrola .env súboru...
   ✅ .env súbor existuje
   ✅ DATABASE_URL je nastavená

2. Testovanie pripojenia k databáze...
   ✅ Pripojenie k databáze úspešné

3. Kontrola existencie tabuľky User...
   ✅ Tabuľka User existuje

4. Kontrola používateľov v databáze...
   ✅ Počet používateľov: 3

   Používatelia v databáze:
   - Super Administrator (superadmin@local.test) - SUPER_ADMIN
   - Administrator (admin@local.test) - ADMIN
   - Regular User (user@local.test) - USER

5. Kontrola hashovania hesiel...
   ✅ Heslá sú správne hashované

==================================================
✅ VŠETKO JE V PORIADKU!

Môžete sa prihlásiť s jedným z týchto účtov:
- superadmin@local.test / superadmin123!
- admin@local.test / admin123!
- user@local.test / user123!
==================================================
```

**→ Prihlásenie by malo fungovať!** 🎉

#### ❌ Problémy Nájdené:

Ak diagnostika ukáže chyby, spustite:
```bash
npm run fix-login
```

Tento príkaz automaticky:
1. Vytvorí .env (ak chýba)
2. Overí databázu
3. Vymaže používateľov s nehashovanými heslami
4. Vytvorí nových používateľov so správnymi heslami

---

## 🔍 Technické Detaily

### Prečo To Nefungovalo?

**Stará verzia (nefunkčná s Prisma 7.x):**
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // ❌ Chyba!
```

**Nová verzia (funguje s Prisma 7.x):**
```javascript
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

require('dotenv').config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter }); // ✅ Funguje!
```

### Prečo Je To Potrebné?

Prisma 7.x zaviedla novú architektúru s adaptermi pre lepšiu podporu rôznych databáz. PostgreSQL vyžaduje `@prisma/adapter-pg`, ktorý spravuje connection pool a komunikáciu s databázou.

---

## 🆘 Ak Stále Nefunguje

### 1. Overte DATABASE_URL

Otvorte `.env` súbor a skontrolujte:
```env
DATABASE_URL="******localhost:5432/nazov_databazy"
```

### 2. Overte PostgreSQL Beží

**Docker:**
```bash
docker ps
```

**Lokálny:**
```bash
psql -h localhost -U postgres
```

### 3. Získajte Detailné Logy

```bash
npm run check-setup > diagnostika.txt 2>&1
```

Pošlite súbor `diagnostika.txt` spolu s otázkou.

---

## 📚 Ďalšie Zdroje

- **[INDEX_DOKUMENTACIE.md](./INDEX_DOKUMENTACIE.md)** - Prehľad všetkých návodov
- **[FIX_401_CHYBA.md](./FIX_401_CHYBA.md)** - Riešenie 401 chyby
- **[VASHE_RIESENIE.md](./VASHE_RIESENIE.md)** - Podrobné vysvetlenie problémov

---

## ✅ Zhrnutie

1. **Stiahli ste opravu:** `git pull`
2. **Spustite diagnostiku:** `npm run check-setup`
3. **Ak treba, opravte:** `npm run fix-login`
4. **Reštartujte:** `npm run dev`
5. **Prihláste sa:** superadmin@local.test / superadmin123!

**Teraz by všetko malo fungovať!** 🎉
