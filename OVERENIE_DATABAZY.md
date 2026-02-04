# Overenie Databázy - Kompletný Návod

## Problém

Spustili ste príkazy `npm run db:generate`, `npm run db:push` a `npm run db:seed`, ale keď sa pozriete na neon.tech → Tables, nevidíte tam databázové tabuľky.

## Rýchle Overenie (3 kroky)

### 1. Spustite overovací skript

```bash
npm run db:check
```

### 2. Ak vidíte tabuľky ✅

```
✅ DATABÁZA JE SPRÁVNE NASTAVENÁ!
```

Všetko funguje! Môžete pokračovať.

### 3. Ak nevidíte tabuľky ❌

```
❌ V databáze nie sú žiadne tabuľky!
```

Pokračujte podľa návodu nižšie.

---

## Detailné Overenie

### Krok 1: Skontrolujte DATABASE_URL

**Windows:**
```cmd
echo %DATABASE_URL%
```

**Linux/Mac:**
```bash
echo $DATABASE_URL
```

**Výsledok:**
- Ak vidíte connection string → ✅ OK
- Ak vidíte prázdny riadok → ❌ DATABASE_URL nie je nastavená

**Riešenie ak chýba:**
1. Otvorte súbor `.env`
2. Pridajte:
   ```
   DATABASE_URL="postgresql://neondb_owner:npg...@ep-...neon.tech/neondb?sslmode=require"
   ```
3. **Dôležité:** Odstráňte `&channel_binding=require` ak tam je!

---

### Krok 2: Spustite databázové príkazy

#### 2.1 Vygenerujte Prisma Client

```bash
npm run db:generate
```

**Očakávaný výstup:**
```
✔ Generated Prisma Client (v7.2.0) to ./node_modules/@prisma/client in 171ms
```

**Ak vidíte chybu:** Skontrolujte DATABASE_URL.

#### 2.2 Vytvorte tabuľky v databáze

```bash
npm run db:push
```

**Očakávaný výstup:**
```
🚀  Your database is now in sync with your Prisma schema.
Done in 3.45s.
```

**Čo tento príkaz robí:**
- Číta `prisma/schema.prisma`
- Vytvára 9 tabuliek v databáze:
  - users
  - customers
  - ride_sessions
  - reservations
  - payments
  - vouchers
  - partner_vouchers
  - challenge_attempts
  - newsletter_subscribers

#### 2.3 Pridajte testovacích používateľov

```bash
npm run db:seed
```

**Očakávaný výstup:**
```
🌱 Starting database seed...
✅ Created SUPER_ADMIN user: superadmin@local.test
✅ Created ADMIN user: admin@local.test
✅ Created USER: user@local.test
🎉 Database seeding completed!
```

**Čo tento príkaz robí:**
- Pridá 3 testovacích používateľov
- S hesiel `superadmin123!`, `admin123!`, `user123!`

#### 2.4 Overte, že všetko funguje

```bash
npm run db:check
```

**Očakávaný výstup:**
```
🔍 Overovanie databázy...

✅ Pripojenie k databáze úspešné
✅ Databáza: neondb
✅ Host: ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech

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

### Krok 3: Skontrolujte Neon.tech Dashboard

1. **Prihláste sa:** https://console.neon.tech

2. **Vyberte projekt:**
   - Skontrolujte, že máte vybraný správny projekt
   - Host v DATABASE_URL musí zodpovedať projektu v Neon

3. **Prejdite na Tables:**
   - Kliknite na "Tables" v ľavom menu
   - Mali by ste vidieť 9 tabuliek

4. **Skontrolujte users tabuľku:**
   - Kliknite na "users"
   - Mali by ste vidieť 3 riadky
   - Každý s iným email a role

5. **SQL Editor (voliteľné):**
   - Kliknite na "SQL Editor"
   - Spustite:
     ```sql
     SELECT * FROM users;
     ```
   - Mali by ste vidieť 3 používateľov

---

## Riešenie Problémov

### Problém 1: "Žiadne tabuľky v databáze"

**Príznaky:**
- `npm run db:check` hovorí "❌ V databáze nie sú žiadne tabuľky!"
- V Neon.tech nevidíte tabuľky

**Riešenie:**
```bash
npm run db:push     # Vytvorí tabuľky
npm run db:seed     # Pridá používateľov
npm run db:check    # Overí
```

---

### Problém 2: "Nesprávna databáza"

**Príznaky:**
- Tabuľky existujú podľa `npm run db:check`
- Ale nevidíte ich v Neon.tech dashboarde

**Riešenie:**
1. Porovnajte host v DATABASE_URL s projektom v Neon
2. DATABASE_URL obsahuje: `@ep-XXXXX-YYYY.c-4.us-east-1.aws.neon.tech`
3. Projekt v Neon musí mať rovnaký host
4. Ak sa líšia, používate inú databázu!

**Ako opraviť:**
1. Prejdite na neon.tech
2. Vyberte správny projekt
3. Zkopírujte connection string z dashboardu
4. Aktualizujte `.env` súbor
5. Spustite znova: `npm run db:push` a `npm run db:seed`

---

### Problém 3: "Chyba pripojenia"

**Príznaky:**
```
❌ Chyba pri pripojení k databáze!
Chybová správa: Connection refused
```

**Riešenie:**
1. **Skontrolujte DATABASE_URL:**
   - Musí začínať `postgresql://`
   - Musí obsahovať používateľské meno a heslo
   - Musí končiť `?sslmode=require`

2. **Odstráňte channel_binding:**
   ```
   # ZLE (s channel_binding):
   postgresql://...?sslmode=require&channel_binding=require
   
   # SPRÁVNE (bez channel_binding):
   postgresql://...?sslmode=require
   ```

3. **Zkopírujte nový connection string:**
   - Neon.tech → Dashboard → Connection String
   - Zkopírujte kompletný string
   - Vložte do `.env`

---

### Problém 4: "Tabuľky existujú ale sú prázdne"

**Príznaky:**
- `npm run db:check` ukazuje tabuľky
- Ale `users` má `(0 rows)`

**Riešenie:**
```bash
npm run db:seed     # Pridá testovacích používateľov
npm run db:check    # Overí
```

---

### Problém 5: "DATABASE_URL is not defined"

**Príznaky:**
```
❌ DATABASE_URL nie je nastavená!
```

**Riešenie:**
1. Vytvorte súbor `.env` v root priečinku projektu
2. Pridajte:
   ```
   DATABASE_URL="postgresql://neondb_owner:npg_XXXXX@ep-XXXXX.aws.neon.tech/neondb?sslmode=require"
   ```
3. Uložte súbor
4. Spustite znova: `npm run db:check`

---

## Manuálne Overenie cez SQL

Ak chcete overiť databázu manuálne cez SQL príkazy:

### 1. Otvorte Neon SQL Editor

https://console.neon.tech → Váš projekt → SQL Editor

### 2. Overte tabuľky

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

**Očakávaný výsledok:** 9 tabuliek

### 3. Overte používateľov

```sql
SELECT email, name, role, "createdAt"
FROM users
ORDER BY "createdAt";
```

**Očakávaný výsledok:** 3 používatelia

### 4. Spočítajte riadky v každej tabuľke

```sql
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM ride_sessions) as ride_sessions,
  (SELECT COUNT(*) FROM reservations) as reservations,
  (SELECT COUNT(*) FROM payments) as payments,
  (SELECT COUNT(*) FROM vouchers) as vouchers,
  (SELECT COUNT(*) FROM partner_vouchers) as partner_vouchers,
  (SELECT COUNT(*) FROM challenge_attempts) as challenge_attempts,
  (SELECT COUNT(*) FROM newsletter_subscribers) as newsletter_subscribers;
```

---

## Checklist Pre Overenie

Použite tento checklist pre kompletné overenie:

- [ ] DATABASE_URL je nastavená v `.env` súbore
- [ ] DATABASE_URL neobsahuje `&channel_binding=require`
- [ ] `npm run db:generate` prešlo úspešne
- [ ] `npm run db:push` vytvorilo tabuľky
- [ ] `npm run db:seed` pridalo používateľov
- [ ] `npm run db:check` ukazuje 9 tabuliek
- [ ] `npm run db:check` ukazuje 3 používateľov
- [ ] Neon.tech dashboard ukazuje rovnaké tabuľky
- [ ] Môžete sa prihlásiť do aplikácie

---

## Prevencia Problémov

Pre budúcnosť, aby ste sa vyhli problémom:

### 1. Vždy používajte `.env` súbor
- Lokálne nastavenia → `.env`
- Produkcia (Vercel) → Environment Variables v dashboarde

### 2. Nikdy necommitujte `.env`
- `.env` je v `.gitignore`
- Každé prostredie má vlastné nastavenie

### 3. Pravidelne overujte databázu
```bash
npm run db:check
```

### 4. Pri zmenách v schéme
```bash
npm run db:generate  # Po zmene schema.prisma
npm run db:push      # Aplikuje zmeny do DB
```

---

## Súhrn Príkazov

```bash
# Generovanie Prisma Client
npm run db:generate

# Vytvorenie tabuliek
npm run db:push

# Pridanie testovacích používateľov
npm run db:seed

# Overenie databázy
npm run db:check

# Otvorenie Prisma Studio (GUI)
npm run db:studio
```

---

## Dodatočné Zdroje

- **INSTALACIA.md** - Kompletný inštalačný návod
- **VERCEL_ENV_SETUP.md** - Nastavenie environment variables pre Vercel
- **INTERNAL_SERVER_ERROR.md** - Riešenie chýb pri prihlásení
- **QUICK_LOGIN_FIX.md** - Rýchle riešenie prihlasovacích problémov

---

## Kontakt a Podpora

Ak stále máte problémy:
1. Skontrolujte všetky kroky vyššie
2. Spustite `npm run db:check` a pozrite si výstup
3. Skontrolujte Vercel deployment logs (ak ide o produkciu)
4. Overte, že DATABASE_URL je správne nastavená

---

**Posledná aktualizácia:** 2026-02-04
