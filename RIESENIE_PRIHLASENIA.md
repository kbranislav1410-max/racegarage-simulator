# Riešenie Problému s Prihlásením

## Problém
Prihlasovacia stránka sa zobrazuje, ale nie je možné sa prihlásiť. Tabuľka `users` v databáze je prázdna.

## Príčiny

Existujú tri hlavné príčiny, prečo prihlásenie nefunguje:

### 1. Chýbajúci `.env` súbor (Najčastejšia príčina)
Ak neexistuje súbor `.env`, aplikácia sa nemôže pripojiť k databáze.

### 2. Databáza nie je inicializovaná
Ak tabuľky v databáze neboli vytvorené príkazom `npm run db:push`.

### 3. Používatelia neboli vytvorení
Ak nebol spustený seed príkaz `npm run db:seed`, tabuľka users je prázdna.

## Riešenie Krok za Krokom

### Krok 1: Skontrolujte, či existuje `.env` súbor

```bash
# V priečinku projektu skontrolujte, či existuje .env
ls -la .env
```

**Ak súbor neexistuje**, vytvorte ho:

```bash
# Na Windows (PowerShell):
Copy-Item .env.example .env

# Na Mac/Linux:
cp .env.example .env
```

### Krok 2: Nastavte DATABASE_URL v `.env` súbore

Otvorte súbor `.env` v textovom editore a nastavte správne pripojenie:

```env
DATABASE_URL="postgresql://uzivatel:heslo@localhost:5432/nazov_databazy"
```

**Príklady:**

Pre Docker PostgreSQL:
```env
DATABASE_URL="postgresql://simulator:simulator@localhost:5432/simulator"
```

Pre lokálny PostgreSQL:
```env
DATABASE_URL="postgresql://postgres:vase_heslo@localhost:5432/racegarage_simulator"
```

**Dôležité:** Nahraďte:
- `uzivatel` - vaše PostgreSQL používateľské meno
- `heslo` - vaše PostgreSQL heslo
- `localhost:5432` - adresa a port PostgreSQL servera
- `nazov_databazy` - názov vašej databázy

### Krok 3: Spustite Diagnostický Skript

```bash
npm run check-setup
```

Tento príkaz skontroluje:
- ✅ Existenciu `.env` súboru
- ✅ Pripojenie k databáze
- ✅ Existenciu tabuliek
- ✅ Počet používateľov v databáze

### Krok 4: Inicializujte Databázu

```bash
# 1. Vygenerujte Prisma Client
npm run db:generate

# 2. Vytvorte databázové tabuľky
npm run db:push

# 3. Vytvorte testovacích používateľov
npm run db:seed
```

Po úspešnom spustení seed príkazu by ste mali vidieť:

```
🌱 Starting database seed...
✅ Created SUPER_ADMIN user: superadmin@local.test
✅ Created ADMIN user: admin@local.test
✅ Created USER: user@local.test
🎉 Database seeding completed!
```

### Krok 5: Reštartujte Aplikáciu

```bash
# Zastavte aplikáciu (Ctrl+C v terminále kde beží npm run dev)
# Potom spustite znova:
npm run dev
```

### Krok 6: Skúste sa Prihlásiť

Otvorte prehliadač na `http://localhost:3000` a skúste sa prihlásiť s jedným z testovacích účtov:

**Testovacie účty:**
```
Super Admin:
Email: superadmin@local.test
Heslo: superadmin123!

Admin:
Email: admin@local.test
Heslo: admin123!

Používateľ:
Email: user@local.test
Heslo: user123!
```

## Časté Chyby a Riešenia

### Chyba: "Can't reach database server"

**Príčina:** PostgreSQL server nebeží alebo nesprávne nastavenie v `.env`

**Riešenie:**
1. Skontrolujte, či PostgreSQL beží:
   - **Docker:** `docker ps` - mali by ste vidieť kontajner postgres
   - **Windows:** Skontrolujte Windows Services, či beží PostgreSQL
2. Overte `DATABASE_URL` v `.env` súbore
3. Skúste sa pripojiť k databáze manuálne:
   ```bash
   psql -h localhost -U postgres -d racegarage_simulator
   ```

### Chyba: "Relation 'User' does not exist"

**Príčina:** Databázové tabuľky neboli vytvorené

**Riešenie:**
```bash
npm run db:push
```

### Chyba: "Invalid email or password" (po seed)

**Príčina:** Používatelia neboli správne vytvorení alebo aplikácia nevidí zmeny

**Riešenie:**
1. Skontrolujte, či sú používatelia v databáze:
   ```bash
   npx prisma studio
   ```
   Otvorte tabuľku `User` a skontrolujte, či existujú používatelia

2. Reštartujte aplikáciu:
   ```bash
   # Zastavte aplikáciu (Ctrl+C)
   npm run dev
   ```

3. Vyčistite cache prehliadača a localStorage:
   - Otvorte DevTools (F12)
   - Prejdite na Application → Local Storage
   - Vymažte všetky položky
   - Obnovte stránku (F5)

### Manuálne Pridanie Používateľa (Nie je odporúčané)

Ak potrebujete manuálne pridať používateľa cez Prisma Studio, **musíte** použiť správne hashované heslo:

1. Vygenerujte hash hesla:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('vase_heslo', 10).then(hash => console.log(hash));"
   ```

2. Použite tento hash v Prisma Studio pri vytváraní používateľa

**DÔLEŽITÉ:** Prosté textové heslo nebude fungovať! Heslo musí byť hashované pomocou bcrypt.

## Verifikácia Úspešnej Inštalácie

Po dokončení všetkých krokov:

1. ✅ Súbor `.env` existuje a obsahuje správne `DATABASE_URL`
2. ✅ Príkaz `npm run check-setup` nehlási chyby
3. ✅ V Prisma Studio (`npx prisma studio`) vidíte 3 používateľov v tabuľke User
4. ✅ Aplikácia beží na `http://localhost:3000`
5. ✅ Môžete sa prihlásiť jedným z testovacích účtov

## Ďalšia Pomoc

Ak problém pretrváva:

1. Skontrolujte logy aplikácie v termináli kde beží `npm run dev`
2. Otvorte DevTools v prehliadači (F12) a skontrolujte Console a Network taby
3. Spustite: `npm run check-setup` a pošlite výstup
4. Vytvorte issue v GitHub repozitári s:
   - Výstupom z `npm run check-setup`
   - Logmi z terminálu
   - Snímkou obrazovky z DevTools Console

## Rýchly Checklist

```bash
# 1. Skontrolujte .env
cat .env

# 2. Overte databázové pripojenie
npm run check-setup

# 3. Ak treba, inicializujte databázu
npm run db:generate
npm run db:push
npm run db:seed

# 4. Reštartujte aplikáciu
# Ctrl+C v termináli kde beží dev server
npm run dev

# 5. Prihláste sa
# Otvorte http://localhost:3000
# superadmin@local.test / superadmin123!
```
