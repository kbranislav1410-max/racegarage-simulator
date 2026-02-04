# Riešenie Internal Server Error pri prihlásení

## Problém

Aplikácia je úspešne nasadená na Vercel, ale pri pokuse o prihlásenie s údajmi:
- **Email:** `superadmin@local.test`
- **Heslo:** `superadmin123!`

Zobrazuje sa chyba: **"Internal Server Error"**

## Najpravdepodobnejšie príčiny

### 1. DATABASE_URL nie je nastavená v Vercel (80% pravdepodobnosť)

**Problém:** Environment variable DATABASE_URL nie je nastavená v Vercel prostredí.

**Ako zistiť:**
1. Choď do Vercel Dashboard
2. Vyber svoj projekt
3. Klikni na **Settings** → **Environment Variables**
4. Skontroluj, či existuje premenná `DATABASE_URL`

**Riešenie:**
1. V Vercel Dashboard idi do **Settings** → **Environment Variables**
2. Klikni **Add New**
3. **Name:** `DATABASE_URL`
4. **Value:** Tvoj Neon.tech connection string:
   ```
   postgresql://neondb_owner:npg_n2zPtwZ8Hrdi@ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   ⚠️ **DÔLEŽITÉ:** Odstráň `&channel_binding=require` z connection stringu!

5. **Environment:** Vyber `Production`, `Preview`, a `Development`
6. Klikni **Save**
7. **Redeploy** aplikáciu:
   - Idi do **Deployments**
   - Klikni na **...** (tri bodky) pri najnovšom deployment
   - Vyber **Redeploy**

### 2. Databáza je prázdna - používatelia nie sú vytvorení (15% pravdepodobnosť)

**Problém:** Production databáza neobsahuje žiadnych používateľov.

**Ako zistiť:**
Pozri sa do Vercel function logs - uvidíš:
```
[LOGIN] User found: No
```

**Riešenie:**

**Možnosť A: Seedovať produkčnú databázu lokálne**
```bash
# Použij production DATABASE_URL
DATABASE_URL="postgresql://neondb_owner:npg_n2zPtwZ8Hrdi@ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" npm run db:seed
```

**Možnosť B: Seedovať cez Neon.tech dashboard**
1. Choď do Neon.tech dashboard
2. Vyber svoju databázu
3. Klikni na **SQL Editor**
4. Spusti seed SQL príkazy manuálne

**Možnosť C: Pridať používateľa manuálne**
V Neon SQL Editor spusti:
```sql
-- Vytvor používateľa s bcrypt hashovaným heslom
INSERT INTO users (email, name, role, password, "createdAt", "updatedAt")
VALUES (
  'superadmin@local.test',
  'Super Admin',
  'SUPER_ADMIN',
  '$2a$10$YourBcryptHashedPasswordHere',
  NOW(),
  NOW()
);
```

**Vygeneruj bcrypt hash lokálne:**
```bash
# V Node.js REPL alebo vytvor malý skript
node -e "console.log(require('bcryptjs').hashSync('superadmin123!', 10))"
```

### 3. Chyba v connection string formáte (5% pravdepodobnosť)

**Problém:** Connection string obsahuje neplatné parametre alebo zlý formát.

**Riešenie:**
Skontroluj, že connection string:
- Začína s `postgresql://`
- Obsahuje `?sslmode=require`
- **NEOBSAHUJE** `&channel_binding=require`

**Správny formát:**
```
postgresql://user:password@host:port/database?sslmode=require
```

**Nesprávny formát (nefunguje):**
```
postgresql://user:password@host:port/database?sslmode=require&channel_binding=require
```

## Ako zistiť presnú príčinu - Kontrola Vercel Logs

### Krok 1: Otvor Vercel Function Logs

1. Choď do **Vercel Dashboard**
2. Vyber svoj projekt
3. Klikni na **Deployments**
4. Vyber najnovší deployment (hore)
5. Klikni na **Functions** tab
6. Nájdi `POST /api/auth/login`
7. Klikni naň a pozri si logs

### Krok 2: Prečítaj si error message

Teraz s rozšíreným logovaním uvidíš presný error:

```
[LOGIN] Attempting login for email: superadmin@local.test
[LOGIN] Error details: [detaily erroru]
[LOGIN] Error message: [konkrétna chyba]
```

**Možné errory a riešenia:**

| Error Message | Príčina | Riešenie |
|--------------|---------|----------|
| `DATABASE_URL is not defined` | Chýba env variable | Pridaj DATABASE_URL v Settings |
| `Connection refused` | Zlý connection string | Skontroluj formát |
| `Invalid connection string` | Chyba vo formáte | Odstráň channel_binding |
| `User found: No` | Prázdna databáza | Seeduj databázu |
| `SSL connection error` | SSL problém | Pridaj `?sslmode=require` |

## Kompletný troubleshooting checklist

### ✅ Krok 1: Skontroluj environment variables

```bash
# V Vercel Dashboard → Settings → Environment Variables
# Musí existovať:
DATABASE_URL=postgresql://...?sslmode=require
```

### ✅ Krok 2: Overiť connection string

Connection string by mal vyzerať takto:
```
postgresql://neondb_owner:[heslo]@ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Odstráň:**
- `&channel_binding=require` ❌
- Akékoľvek iné neplatné parametre ❌

### ✅ Krok 3: Seeduj databázu

```bash
# Použij production DATABASE_URL
DATABASE_URL="postgresql://..." npm run db:seed
```

**Očakávaný output:**
```
🌱 Starting database seed...
✅ Created SUPER_ADMIN user: superadmin@local.test
✅ Created ADMIN user: admin@local.test
✅ Created USER: user@local.test
🎉 Database seeding completed!
```

### ✅ Krok 4: Redeploy aplikáciu

Po akejkoľvek zmene:
1. Idi do Vercel Dashboard → Deployments
2. Klikni **...** → **Redeploy**
3. Počkaj ~2-3 minúty

### ✅ Krok 5: Otestuj prihlásenie

1. Choď na: `https://[tvoja-app].vercel.app/login`
2. Zadaj:
   - Email: `superadmin@local.test`
   - Heslo: `superadmin123!`
3. Klikni **Prihlásiť sa**

**Ak to funguje:** ✅
- Budeš presmerovaný na dashboard
- Uvidíš menu s možnosťami

**Ak stále nefunguje:** ❌
- Pozri si Vercel function logs (Step 1-2)
- Skontroluj presný error message
- Aplikuj riešenie podľa error message

## Overenie úspešnosti

### Logy pri úspešnom prihlásení:

```
[LOGIN] Attempting login for email: superadmin@local.test
[LOGIN] User found: Yes
[LOGIN] User role: SUPER_ADMIN
[LOGIN] Password validation: Valid
[LOGIN] Login successful for user: superadmin@local.test
```

### Čo uvidíš v prehliadači:

- ✅ Presmerovanie na `/dashboard`
- ✅ Bočné menu s možnosťami
- ✅ Horná lišta s menom používateľa
- ✅ Žiadne error hlášky

## Dodatočné zdroje

### Ako spustiť Prisma migrate na production DB:

```bash
DATABASE_URL="[production-url]" npx prisma migrate deploy
```

### Ako overiť, že databáza obsahuje používateľov:

```bash
# V Neon SQL Editor alebo lokálne:
psql "[production-url]"

# Spusti:
SELECT email, role FROM users;
```

**Očakávaný výstup:**
```
           email            |     role
----------------------------+--------------
 superadmin@local.test      | SUPER_ADMIN
 admin@local.test           | ADMIN
 user@local.test            | USER
```

### Ako vytvoriť nového používateľa manuálne:

```sql
-- Vygeneruj hash lokálne pomocou:
-- node -e "console.log(require('bcryptjs').hashSync('tvojeHeslo', 10))"

INSERT INTO users (email, name, role, password, "createdAt", "updatedAt")
VALUES (
  'tvoj@email.sk',
  'Tvoje Meno',
  'SUPER_ADMIN',
  '$2a$10$[tvoj-bcrypt-hash]',
  NOW(),
  NOW()
);
```

## Zhrnutie

1. **Najčastejší problém:** DATABASE_URL nie je nastavená v Vercel
   - **Fix:** Pridaj v Settings → Environment Variables

2. **Druhý najčastejší:** Databáza je prázdna
   - **Fix:** `DATABASE_URL="..." npm run db:seed`

3. **Tretí najčastejší:** Zlý formát connection stringu
   - **Fix:** Odstráň `&channel_binding=require`

4. **Vždy skontroluj Vercel logs** pre presný error message

5. **Po každej zmene redeploy** aplikáciu

---

**Potrebuješ pomoc?**
- Skontroluj Vercel function logs
- Pozri si presný error message
- Použi toto troubleshooting guide
- Všetky riešenia sú vyššie podľa typu erroru
