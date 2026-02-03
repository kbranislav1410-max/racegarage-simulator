# Inštalácia a Spustenie Racegarage Simulator

## Požiadavky

Pred spustením aplikácie potrebujete mať nainštalované:

- **Node.js** (verzia 20 alebo vyššia)
- **PostgreSQL** (verzia 14 alebo vyššia)
- **npm** alebo **yarn** (správca balíkov)

## Postup Inštalácie

### 1. Klonovanie Repozitára

```bash
git clone https://github.com/kbranislav1410-max/racegarage-simulator.git
cd racegarage-simulator
git checkout copilot/add-user-roles-superadmin-admin-user
```

### 2. Inštalácia Závislostí

```bash
npm install
```

### 3. Nastavenie Databázy

#### 3.1. Vytvorenie PostgreSQL Databázy

Prihláste sa do PostgreSQL a vytvorte novú databázu:

```bash
psql -U postgres
```

V PostgreSQL konzole:

```sql
CREATE DATABASE racegarage_simulator;
\q
```

#### 3.2. Konfigurácia Pripojenia k Databáze

Vytvorte súbor `.env` v koreňovom priečinku projektu (skopírujte zo `.env.example`):

```bash
cp .env.example .env
```

Upravte súbor `.env` a nastavte pripojenie k databáze:

```env
DATABASE_URL="postgresql://postgres:vase_heslo@localhost:5432/racegarage_simulator"
```

Nahraďte:
- `postgres` - vaše používateľské meno PostgreSQL
- `vase_heslo` - vaše heslo PostgreSQL
- `localhost:5432` - adresa a port vášho PostgreSQL servera
- `racegarage_simulator` - názov databázy

### 4. Inicializácia Databázy

#### 4.1. Vygenerovanie Prisma Klienta

```bash
npm run db:generate
```

#### 4.2. Vytvorenie Databázových Tabuliek

```bash
npm run db:push
```

#### 4.3. Naplnenie Databázy Testovacími Údajmi

```bash
npm run db:seed
```

Tento príkaz vytvorí troch testovacích používateľov:

1. **Super Admin**
   - Email: `superadmin@local.test`
   - Heslo: `superadmin123!`
   - Oprávnenia: Plný prístup, môže všetko

2. **Admin**
   - Email: `admin@local.test`
   - Heslo: `admin123!`
   - Oprávnenia: Prístup ku všetkému okrem mazania

3. **User (Používateľ)**
   - Email: `user@local.test`
   - Heslo: `user123!`
   - Oprávnenia: Základný prístup, nevidí finančné údaje, nemôže mazať

### 5. Spustenie Aplikácie

#### Vývojový Režim

```bash
npm run dev
```

Aplikácia bude dostupná na adrese: `http://localhost:3000`

#### Produkčný Build

```bash
npm run build
npm start
```

## Prihlásenie do Aplikácie

1. Otvorte prehliadač a prejdite na `http://localhost:3000`
2. Budete presmerovaní na prihlasovaciu stránku
3. Použite jeden z testovacích účtov:
   - Super Admin: `superadmin@local.test` / `superadmin123!`
   - Admin: `admin@local.test` / `admin123!`
   - User: `user@local.test` / `user123!`

## Používateľské Roly a Oprávnenia

### Super Admin (SUPER_ADMIN)
- **Plný prístup** ku všetkým funkciám aplikácie
- Môže **mazať** všetky záznamy (zákazníkov, jazdy, rezervácie, platby, atď.)
- Vidí všetky finančné ukazovatele
- Prístup k nastaveniam a platbám

### Admin (ADMIN)
- Prístup ku všetkým sekciám aplikácie
- **Nemôže mazať** žiadne záznamy
- Vidí všetky finančné ukazovatele
- Prístup k nastaveniam a platbám

### User (USER)
- Môže pracovať so základnými funkciami aplikácie
- **Nemôže mazať** žiadne záznamy
- **Nevidí** finančné ukazovatele a štatistiky príjmov
- **Nemá prístup** k sekcii Platby
- **Nemá prístup** k sekcii Nastavenia
- Má prístup k: Prehľad, Zákazníci, Jazdy, Rezervácie, Výzva, Vouchery

## Ďalšie Užitočné Príkazy

### Zobrazenie Databázy v Prisma Studio

```bash
npm run db:studio
```

Otvorí webové rozhranie na `http://localhost:5555` pre správu databázy.

### Linting a Formátovanie

```bash
npm run lint
npm run format
```

### Migrácie Databázy

Ak meníte schému databázy:

```bash
npm run db:migrate
```

## Riešenie Problémov

### Chyba pripojenia k databáze

- Skontrolujte, či PostgreSQL server beží
- Overte správnosť prihlasovaciích údajov v `.env`
- Skontrolujte, či databáza existuje

### Port 3000 je obsadený

Použite iný port:

```bash
PORT=3001 npm run dev
```

### Prisma Client chyby

Regenerujte Prisma Client:

```bash
npm run db:generate
```

### Prihlásenie nefunguje / Tabuľka users je prázdna

Toto je najčastejší problém! Riešenie:

1. **Najprv skontrolujte, či máte `.env` súbor:**
   ```bash
   ls -la .env
   ```
   Ak neexistuje, vytvorte ho:
   ```bash
   cp .env.example .env
   ```

2. **Overte, že `.env` obsahuje DATABASE_URL:**
   ```bash
   cat .env
   ```
   Mal by obsahovať niečo ako:
   ```
   DATABASE_URL="postgresql://postgres:heslo@localhost:5432/racegarage_simulator"
   ```

3. **Spustite diagnostický skript:**
   ```bash
   npm run check-setup
   ```
   Tento skript skontroluje všetko a povie vám presne, čo treba opraviť.

4. **Ak tabuľka users je prázdna, spustite seed:**
   ```bash
   npm run db:seed
   ```
   Mali by ste vidieť:
   ```
   ✅ Created SUPER_ADMIN user: superadmin@local.test
   ✅ Created ADMIN user: admin@local.test
   ✅ Created USER: user@local.test
   ```

5. **Reštartujte aplikáciu:**
   ```bash
   # Zastavte aplikáciu (Ctrl+C)
   npm run dev
   ```

6. **Vyčistite cache prehliadača:**
   - Otvorte DevTools (F12)
   - Prejdite na Application → Local Storage
   - Vymažte všetky položky pre localhost:3000
   - Obnovte stránku (F5)

**Dôležité:** Ak ste pridali používateľa manuálne cez Prisma Studio, nebude fungovať! Heslá musia byť hashované pomocou bcrypt. Vymažte manuálne vytvorených používateľov a spustite `npm run db:seed`.

Viac informácií: [RIESENIE_PRIHLASENIA.md](./RIESENIE_PRIHLASENIA.md)

## Podpora

Pre otázky a problémy vytvorte issue v GitHub repozitári.
