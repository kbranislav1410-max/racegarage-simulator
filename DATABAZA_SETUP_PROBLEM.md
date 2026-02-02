# 🚨 RIEŠENIE: Chyba "PaymentRecord does not exist"

## Váš Problém

```
ERROR:  relation "PaymentRecord" does not exist
LINE 2: FROM "PaymentRecord"
```

## Čo To Znamená?

Databáza **NEMÁ** vytvorené tabuľky! Prisma schema existuje, ale tabuľky v PostgreSQL databáze ešte neboli vytvorené.

---

## ⚡ SUPER RÝCHLE RIEŠENIE (2 Minúty)

### Krok 1: Zatvorte psql

```powershell
# V psql termináli napíšte:
\q
```

### Krok 2: V PowerShell spustite:

```powershell
# Prejdite do priečinka projektu
cd C:\Users\kbran\OneDrive\Dokumenty\racegarage-simulator

# Vytvorte tabuľky v databáze
npx prisma db push
```

### Krok 3: Počkajte na potvrdenie

Uvidíte:
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema.
```

### Krok 4: Overte

```powershell
# Znovu sa pripojte k databáze
psql -h localhost -U simulator -d simulator

# Spustite query znova
SELECT receiver, COUNT(*), SUM("amountCents") as total
FROM "PaymentRecord"
GROUP BY receiver;
```

**Teraz by to malo fungovať!** ✅

---

## 📋 Čo `npx prisma db push` Robí?

1. Prečíta váš Prisma schema (`prisma/schema.prisma`)
2. Vytvorí všetky tabuľky v databáze:
   - PaymentRecord ✅
   - RideSession ✅
   - Customer ✅
   - User ✅
   - Settings ✅
   - ... a všetky ostatné

3. Vytvorí všetky stĺpce, indexy, vzťahy
4. Vygeneruje Prisma Client

---

## 🔍 Overenie Že Tabuľky Existujú

### V psql:

```sql
-- Zobraziť všetky tabuľky
\dt

-- Mali by ste vidieť:
-- PaymentRecord
-- RideSession
-- Customer
-- User
-- Settings
-- atď.
```

### Alebo pomocou SQL:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## 🎯 Ak `npx prisma db push` Nefunguje

### Problém 1: "Command not found"

```powershell
# Nainštalujte závislosti
npm install

# Skúste znova
npx prisma db push
```

### Problém 2: "Environment variable not found: DATABASE_URL"

```powershell
# Skontrolujte .env súbor
cat .env

# Malo by obsahovať:
# DATABASE_URL="postgresql://simulator:password@localhost:5432/simulator"
```

### Problém 3: "Can't reach database server"

```powershell
# Overte že PostgreSQL beží
# V Services alebo Docker Desktop
```

---

## 📊 Po Úspešnom db push

### Teraz Môžete Spustiť Queries:

```sql
-- Query 1: Počet platieb podľa príjemcu
SELECT receiver, COUNT(*), SUM("amountCents")/100.0 as total_eur
FROM "PaymentRecord"
GROUP BY receiver;

-- Query 2: Všetky platby
SELECT * FROM "PaymentRecord" LIMIT 10;

-- Query 3: Platby s customer údajmi
SELECT pr.*, c.name, c.email
FROM "PaymentRecord" pr
JOIN "Customer" c ON pr."customerId" = c.id
LIMIT 10;
```

### Alebo Použite Prisma Studio:

```powershell
npx prisma studio
```

Otvorí sa grafické rozhranie na http://localhost:5555 kde vidíte všetky tabuľky!

---

## ✅ Kontrolný Zoznam

Po `npx prisma db push`:

- [ ] Príkaz prebehol úspešne
- [ ] Vidíte "✔ Generated Prisma Client"
- [ ] Vidíte "✔ The database is now in sync"
- [ ] `\dt` v psql zobrazuje tabuľky
- [ ] SQL query na PaymentRecord funguje
- [ ] Aplikácia sa spúšťa bez chýb

---

## 🚀 Teraz Môžete

1. ✅ Spúšťať SQL queries v psql
2. ✅ Použiť Prisma Studio (`npx prisma studio`)
3. ✅ Aplikácia funguje s databázou
4. ✅ Platby sa ukladajú správne
5. ✅ Všetky tabuľky existujú

---

## 💡 Poznámky Pre Budúcnosť

### Kedy Spustiť `npx prisma db push`:

- Po zmene v `schema.prisma`
- Po clone projektu (prvýkrát)
- Po vytvorení novej databázy
- Keď tabuľky neexistujú

### Alternatíva: Migrations

```powershell
# Pre production použite migrations
npx prisma migrate dev --name init

# Toto vytvorí migration súbory
# A použije sa v production
```

---

## 🎉 Zhrnutie

**Problém:** Tabuľky v databáze neexistovali

**Riešenie:**
```powershell
npx prisma db push
```

**Výsledok:** Všetky tabuľky vytvorené, queries fungujú!

**Trvanie:** 2 minúty

**Hotovo!** ✅

---

*Ak stále máte problémy, pošlite output z `npx prisma db push`*
