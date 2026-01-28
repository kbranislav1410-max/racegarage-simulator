# Návod Pre Začiatočníkov: Ako Sa Pripojiť k Databáze

**Pre amatérov - krok za krokom!** 🎓

---

## 📖 Obsah

1. [Úvod](#úvod)
2. [Čo Potrebujete](#čo-potrebujete)
3. [METÓDA 1: Prisma Studio (Najjednoduchšie)](#metóda-1-prisma-studio)
4. [Čo Vidíte v Databáze](#čo-vidíte-v-databáze)
5. [METÓDA 2: SQL Queries](#metóda-2-sql-queries)
6. [Ako Zistiť Problém](#ako-zistiť-problém)
7. [Ako Opraviť Staré Záznamy](#ako-opraviť-staré-záznamy)
8. [Testovanie Po Oprave](#testovanie-po-oprave)
9. [Bežné Problémy](#bežné-problémy)
10. [FAQ](#faq)

---

## Úvod

### Čo Je Databáza?

Databáza je ako **veľká Excel tabuľka**, kde vaša aplikácia ukladá všetky údaje:
- Zákazníkov
- Jazdy
- Platby
- A všetko ostatné

### Prečo Potrebujete Skontrolovať Databázu?

Ak všetky platby idú do "ME" (ku mne) namiesto správneho rozdelenia medzi "ME" a "FRIEND" (kamarát), problém môže byť v:
1. **Starých záznamoch** v databáze (vytvorené pred opravou kódu)
2. **Nesprávnej konfigurácii** (ale kód je teraz správny!)

### Čo Budete Robiť?

1. Otvoríte databázu pomocou nástroja **Prisma Studio**
2. Pozriete si tabuľku `PaymentRecord`
3. Skontrolujete stĺpec `receiver`
4. Ak je problém, opravíte staré záznamy

**Žiadne programovanie nie je potrebné!** ✅

---

## Čo Potrebujete

### Checklist:

- ✅ **Node.js** nainštalovaný (už máte, keď aplikácia beží)
- ✅ **Aplikácia** spustená (`npm run dev`)
- ✅ **Databáza** bežiaca (PostgreSQL)
- ✅ **Terminál** otvorený (Command Prompt / Terminal / PowerShell)

### Ako Overiť:

```bash
# Skontrolujte Node.js
node --version
# Malo by zobraziť: v18.x.x alebo novšie

# Skontrolujte npm
npm --version
# Malo by zobraziť: 9.x.x alebo novšie
```

---

## METÓDA 1: Prisma Studio

### ⭐ ODPORÚČANÁ PRE ZAČIATOČNÍKOV! ⭐

Prisma Studio je **vizuálny nástroj** (ako Excel), kde vidíte databázu bez písania SQL.

### Krok 1: Otvorte Terminál

**Windows:**
- Stlačte `Win + R`
- Napíšte `cmd`
- Stlačte Enter

**Mac:**
- Stlačte `Cmd + Space`
- Napíšte `terminal`
- Stlačte Enter

**Linux:**
- Stlačte `Ctrl + Alt + T`

### Krok 2: Prejdite do Priečinka Projektu

```bash
# Nahraďte cestu svojou cestou k projektu
cd C:\Users\VaseMeno\racegarage-simulator

# Mac/Linux
cd /Users/VaseMeno/racegarage-simulator
```

### Krok 3: Spustite Prisma Studio

```bash
npx prisma studio
```

**Čo sa stane:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Prisma Studio is up on http://localhost:5555
```

### Krok 4: Otvorí Sa Prehliadač

- Automaticky sa otvorí na: **http://localhost:5555**
- Vidíte GUI (grafické rozhranie)
- Žiadny kód, len klikanie! 🖱️

### Krok 5: Kliknite na "PaymentRecord"

V ľavom menu vidíte zoznam tabuliek:
```
┌────────────────────┐
│ Tables             │
├────────────────────┤
│ • User             │
│ • Customer         │
│ • RideSession      │
│ ► PaymentRecord    │  ← KLIKNITE SEM!
│ • Voucher          │
│ • ...              │
└────────────────────┘
```

### Krok 6: Vidíte Tabuľku So Všetkými Platbami

```
PaymentRecord tabuľka:
┌────┬──────────────────────┬──────────┬─────────────┬────────────────┐
│ id │ method               │ receiver │ amountCents │ createdAt      │
├────┼──────────────────────┼──────────┼─────────────┼────────────────┤
│ 1  │ PD_DRIVE_CLUB        │ FRIEND   │ 5000        │ 2026-01-20...  │
│ 2  │ VOUCHER_PARTNER      │ ME       │ 3000        │ 2026-01-21...  │
│ 3  │ VOUCHER_RACEGARAGE   │ ME       │ 2000        │ 2026-01-22...  │
│ 4  │ VOUCHER_PD_DRIVE_... │ FRIEND   │ 4000        │ 2026-01-23...  │
│ 5  │ PD_DRIVE_CLUB        │ FRIEND   │ 2500        │ 2026-01-24...  │
└────┴──────────────────────┴──────────┴─────────────┴────────────────┘
```

### Krok 7: Pozrite sa na Stĺpec "receiver"

**Mal by obsahovať:**
- `ME` - Ja (pre Poukaz - partner, Poukaz - Racegarage)
- `FRIEND` - Kamarát (pre PD Drive Club, Poukaz - PD Drive club)

### Krok 8: Spočítajte

Spočítajte koľko riadkov má:
- `receiver = ME`
- `receiver = FRIEND`

### Krok 9: Porovnajte

**✅ SPRÁVNE (OK):**
```
ME:     15 platieb  (Poukaz - partner, Poukaz - Racegarage)
FRIEND: 10 platieb  (PD Drive Club, Poukaz - PD Drive club)
```

**❌ NESPRÁVNE (PROBLÉM):**
```
ME:     25 platieb  ← Všetko je ME!
FRIEND:  0 platieb  ← Nič nie je FRIEND!
```

### Krok 10: Hotovo!

Teraz viete či je problém v databáze!

---

## Čo Vidíte v Databáze

### Správny Stav (✅ OK)

```
PaymentRecord tabuľka:
┌────┬──────────────────────┬──────────┬────────────────┐
│ id │ method               │ receiver │ amountCents    │
├────┼──────────────────────┼──────────┼────────────────┤
│ 1  │ PD_DRIVE_CLUB        │ FRIEND ✅│ 5000 (€50.00) │
│ 2  │ VOUCHER_PARTNER      │ ME ✅    │ 3000 (€30.00) │
│ 3  │ VOUCHER_RACEGARAGE   │ ME ✅    │ 2000 (€20.00) │
│ 4  │ VOUCHER_PD_DRIVE_... │ FRIEND ✅│ 4000 (€40.00) │
└────┴──────────────────────┴──────────┴────────────────┘

✅ Správne mapovanie:
- PD_DRIVE_CLUB → FRIEND
- VOUCHER_PARTNER → ME
- VOUCHER_RACEGARAGE → ME
- VOUCHER_PD_DRIVE_CLUB → FRIEND
```

### Nesprávny Stav (❌ PROBLÉM)

```
PaymentRecord tabuľka:
┌────┬──────────────────────┬──────────┬────────────────┐
│ id │ method               │ receiver │ amountCents    │
├────┼──────────────────────┼──────────┼────────────────┤
│ 1  │ PD_DRIVE_CLUB        │ ME ❌    │ 5000 (€50.00) │
│ 2  │ VOUCHER_PARTNER      │ ME ✅    │ 3000 (€30.00) │
│ 3  │ VOUCHER_RACEGARAGE   │ ME ✅    │ 2000 (€20.00) │
│ 4  │ VOUCHER_PD_DRIVE_... │ ME ❌    │ 4000 (€40.00) │
└────┴──────────────────────┴──────────┴────────────────┘

❌ Problém: Všetko je ME!
- PD_DRIVE_CLUB by malo byť FRIEND!
- VOUCHER_PD_DRIVE_CLUB by malo byť FRIEND!
```

---

## METÓDA 2: SQL Queries

### Pre Pokročilejších

Ak chcete vidieť dáta cez SQL príkazy namiesto Prisma Studio.

### Krok 1: Pripojte Sa k Databáze

**Windows (psql):**
```bash
psql -U postgres -d simulator
```

**Mac/Linux:**
```bash
psql simulator
```

### Krok 2: Základné Query - Všetky Platby

```sql
SELECT id, method, receiver, "amountCents"/100.0 as suma_eur
FROM "PaymentRecord"
ORDER BY "createdAt" DESC
LIMIT 10;
```

**Výstup:**
```
 id │        method         │ receiver │ suma_eur
────┼───────────────────────┼──────────┼──────────
  5 │ PD_DRIVE_CLUB         │ FRIEND   │    25.00
  4 │ VOUCHER_PD_DRIVE_CLUB │ FRIEND   │    40.00
  3 │ VOUCHER_RACEGARAGE    │ ME       │    20.00
  2 │ VOUCHER_PARTNER       │ ME       │    30.00
  1 │ PD_DRIVE_CLUB         │ FRIEND   │    50.00
(5 rows)
```

### Krok 3: Spočítať Receiverov

```sql
SELECT 
  receiver,
  COUNT(*) as pocet,
  SUM("amountCents")/100.0 as suma_eur
FROM "PaymentRecord"
GROUP BY receiver;
```

**Expected Output (✅ Správne):**
```
 receiver │ pocet │ suma_eur
──────────┼───────┼──────────
 ME       │    15 │   450.00
 FRIEND   │    10 │   500.00
(2 rows)
```

**Problémový Output (❌ Všetko ME):**
```
 receiver │ pocet │ suma_eur
──────────┼───────┼──────────
 ME       │    25 │   950.00
(1 row)
```

### Krok 4: Breakdown Podľa Metódy

```sql
SELECT 
  method,
  receiver,
  COUNT(*) as pocet,
  SUM("amountCents")/100.0 as suma_eur
FROM "PaymentRecord"
GROUP BY method, receiver
ORDER BY method, receiver;
```

**Expected Output (✅ Správne):**
```
        method         │ receiver │ pocet │ suma_eur
───────────────────────┼──────────┼───────┼──────────
 PD_DRIVE_CLUB         │ FRIEND   │     6 │   300.00
 VOUCHER_PARTNER       │ ME       │     8 │   240.00
 VOUCHER_PD_DRIVE_CLUB │ FRIEND   │     4 │   200.00
 VOUCHER_RACEGARAGE    │ ME       │     7 │   210.00
(4 rows)
```

---

## Ako Zistiť Problém

### Query Pre Verifikáciu

```sql
SELECT 
  method,
  receiver,
  COUNT(*) as pocet
FROM "PaymentRecord"
GROUP BY method, receiver
ORDER BY method;
```

### Analýza Výsledku

**❌ Ak vidíte toto (PROBLÉM):**
```
        method         │ receiver │ pocet
───────────────────────┼──────────┼───────
 PD_DRIVE_CLUB         │ ME       │    10  ← ZLÉÉÉ! Malo by FRIEND
 VOUCHER_PARTNER       │ ME       │     8  ← OK
 VOUCHER_PD_DRIVE_CLUB │ ME       │     4  ← ZLÉÉÉ! Malo by FRIEND
 VOUCHER_RACEGARAGE    │ ME       │     7  ← OK
```

**✅ Ak vidíte toto (OK):**
```
        method         │ receiver │ pocet
───────────────────────┼──────────┼───────
 PD_DRIVE_CLUB         │ FRIEND   │    10  ← Správne!
 VOUCHER_PARTNER       │ ME       │     8  ← Správne!
 VOUCHER_PD_DRIVE_CLUB │ FRIEND   │     4  ← Správne!
 VOUCHER_RACEGARAGE    │ ME       │     7  ← Správne!
```

---

## Ako Opraviť Staré Záznamy

### ⚠️ DÔLEŽITÉ: Urobte Si Zálohu!

```bash
# Záloha databázy
pg_dump simulator > backup_$(date +%Y%m%d_%H%M%S).sql
```

### UPDATE Query 1: Opraviť PD_DRIVE_CLUB

```sql
UPDATE "PaymentRecord"
SET receiver = 'FRIEND'
WHERE method = 'PD_DRIVE_CLUB'
  AND receiver = 'ME';
```

**Výstup:**
```
UPDATE 6
```
(Opravených 6 záznamov)

### UPDATE Query 2: Opraviť VOUCHER_PD_DRIVE_CLUB

```sql
UPDATE "PaymentRecord"
SET receiver = 'FRIEND'
WHERE method = 'VOUCHER_PD_DRIVE_CLUB'
  AND receiver = 'ME';
```

**Výstup:**
```
UPDATE 4
```
(Opravených 4 záznamy)

### Verifikačný Query

```sql
SELECT 
  method,
  receiver,
  COUNT(*) as pocet
FROM "PaymentRecord"
GROUP BY method, receiver
ORDER BY method;
```

**Mali by ste vidieť:**
```
        method         │ receiver │ pocet
───────────────────────┼──────────┼───────
 PD_DRIVE_CLUB         │ FRIEND   │    10  ✅
 VOUCHER_PARTNER       │ ME       │     8  ✅
 VOUCHER_PD_DRIVE_CLUB │ FRIEND   │     4  ✅
 VOUCHER_RACEGARAGE    │ ME       │     7  ✅
```

---

## Testovanie Po Oprave

### Test 1: Vytvorte Novú Platbu v Aplikácii

1. Otvorte aplikáciu: http://localhost:3000
2. Dashboard → Zaznamenať jazdu
3. Vyplňte:
   - Zákazník: Vyberte existujúceho
   - Suma: €25.00
   - Metóda: "PD Drive Club"
4. Zaznamenať

### Test 2: Overte v Prisma Studio

```bash
# Ak ešte beží, len refreshnite (F5)
# Ak nie, spustite znova:
npx prisma studio
```

1. Otvorte PaymentRecord
2. Nájdite najnovší záznam (najvyššie id)
3. Skontrolujte:
   - method: `PD_DRIVE_CLUB`
   - receiver: `FRIEND` ✅ (Malo by byť FRIEND!)

### Test 3: Overte v Aplikácii

1. Platby → História platieb
2. Najnovšia platba by mala mať:
   - Metóda: "PD Drive club (→ Kamarát)"
   - Príjemca: 🔵 "→ Kamarát"
3. Karta "Celkom pre kamaráta" by sa mala zvýšiť o €25.00

### Test 4: Overte Vyúčtovanie

1. Platby → Karta "Vyúčtovanie"
2. Malo by správne počítať 50/50 split
3. Napríklad:
   - Kamarát inkasoval: €115.00
   - Ja som inkasoval: €85.00
   - Kamarát mi dlhuje: €15.00

---

## Bežné Problémy

### Problém 1: "npx prisma studio" Nefunguje

**Chyba:**
```
'prisma' is not recognized as an internal or external command
```

**Riešenie:**
```bash
# Nainštalujte Prisma
npm install -D prisma

# Skúste znova
npx prisma studio
```

### Problém 2: Nemôžem Sa Pripojiť k Databáze

**Chyba:**
```
Can't reach database server
```

**Riešenie:**
```bash
# 1. Skontrolujte či PostgreSQL beží
# Windows: Otvorte Services, nájdite PostgreSQL

# 2. Skontrolujte .env súbor
cat .env | grep DATABASE_URL

# 3. Malo by byť niečo ako:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/simulator"
```

### Problém 3: Prisma Studio Je Prázdny

**Vidíte prázdne tabuľky?**

**Riešenie:**
```bash
# 1. Regenerujte Prisma Client
npx prisma generate

# 2. Pushujte schému do databázy
npx prisma db push

# 3. Spustite znova
npx prisma studio
```

### Problém 4: Zabudol Som Heslo k Databáze

**Windows:**
```bash
# Nájdite heslo v .env súbore
type .env | findstr DATABASE_URL
```

**Mac/Linux:**
```bash
# Nájdite heslo v .env súbore
cat .env | grep DATABASE_URL
```

### Problém 5: Port 5555 Je Obsadený

**Chyba:**
```
Error: Port 5555 is already in use
```

**Riešenie:**
```bash
# Použite iný port
npx prisma studio --port 5556

# Potom otvorte: http://localhost:5556
```

### Problém 6: "Permission Denied" Pri Zápise

**Riešenie:**
```bash
# Windows: Spustite Command Prompt ako Administrator
# Mac/Linux: Použite sudo
sudo npx prisma studio
```

### Problém 7: Staré Dáta Sa Neopravia

**UPDATE query nezmení nič?**

**Riešenie:**
```sql
-- Najprv skontrolujte čo je v databáze
SELECT method, receiver, COUNT(*)
FROM "PaymentRecord"
WHERE method IN ('PD_DRIVE_CLUB', 'VOUCHER_PD_DRIVE_CLUB')
GROUP BY method, receiver;

-- Potom UPDATE
UPDATE "PaymentRecord"
SET receiver = 'FRIEND'
WHERE method IN ('PD_DRIVE_CLUB', 'VOUCHER_PD_DRIVE_CLUB')
  AND receiver = 'ME';
```

### Problém 8: Ako Zavriem Prisma Studio?

**Riešenie:**
```bash
# 1. Zatvorte prehliadač
# 2. V termináli stlačte: Ctrl + C
```

---

## FAQ

### Q1: Čo je to databáza?

**A:** Databáza je ako veľká Excel tabuľka kde aplikácia ukladá všetky údaje. Každá tabuľka (ako PaymentRecord) má riadky (jednotlivé záznamy) a stĺpce (vlastnosti záznamu).

### Q2: Môžem niečo pokaziť?

**A:** 
- Ak robíte len **SELECT** queries (čítanie) → **NIE**, nemôžete pokaziť nič
- Ak robíte **UPDATE/DELETE** queries → **ÁNO**, preto si najprv urobte zálohu!

### Q3: Potrebujem vedieť programovať?

**A:** 
- Pre **Prisma Studio** → **NIE**, je to ako Excel, len klikáte
- Pre **SQL queries** → Potrebujete základy SQL, ale naše príklady môžete kopírovať

### Q4: Je to bezpečné?

**A:** 
- **Prisma Studio** bežiach len **lokálne** (localhost:5555)
- Nikto z internetu sa k nemu nedostane
- Je to **bezpečné** na vašom počítači

### Q5: Kde nájdem .env súbor?

**A:** V **root priečinku** projektu (tam kde je package.json):
```
racegarage-simulator/
├── .env              ← Tu!
├── package.json
├── prisma/
├── src/
└── ...
```

### Q6: Čo je to "receiver"?

**A:** 
- `receiver = ME` → Platba ide **vám** (ja)
- `receiver = FRIEND` → Platba ide **kamarátovi**

### Q7: Ako funguje 50/50 vyúčtovanie?

**A:** 
```
Príklad:
- Kamarát inkasoval: €100
- Ja som inkasoval: €50

Výpočet:
friendOwesMe = (100 - 50) / 2 = €25

Výsledok: Kamarát mi dlhuje €25
```

### Q8: Prečo sú niektoré platby ME a niektoré FRIEND?

**A:** Závisí od **metódy platby**:
- PD Drive Club → Inkasuje kamarát (FRIEND)
- Poukaz - partner → Inkasujete vy (ME)
- Poukaz - Racegarage → Inkasujete vy (ME)
- Poukaz - PD Drive club → Inkasuje kamarát (FRIEND)

### Q9: Čo je "amountCents"?

**A:** Suma v centoch. Napríklad:
- `5000` centov = €50.00
- `2500` centov = €25.00
- Delíte 100 pre eurá

### Q10: Ako zavriem Prisma Studio?

**A:** 
1. Zatvorte **prehliadač**
2. V **termináli** stlačte: **Ctrl + C**

---

## Zhrnutie

### Rýchly Návod (TL;DR):

```bash
# 1. Spustite Prisma Studio
npx prisma studio

# 2. Kliknite "PaymentRecord"

# 3. Pozrite "receiver" stĺpec

# 4. Spočítajte ME vs FRIEND

# 5. Ak je všetko ME → Použite UPDATE query na opravu
```

### Kľúčové Body:

✅ **Prisma Studio** je najjednoduchšia metóda (žiadne SQL)
✅ Pozrite sa na stĺpec **"receiver"** v tabuľke PaymentRecord
✅ Malo by byť **mix ME a FRIEND**, nie len ME
✅ Ak je problém, použite **UPDATE queries** na opravu
✅ Vždy si urobte **zálohu** pred UPDATE/DELETE

### Dokumenty Na Prečítanie:

1. **DIAGNOSTIKA_PRIJEMCOV_PLATIEB.md** - Technická diagnostika
2. **PRIJEMCA_PLATIEB_OVERENIE.md** - Overovanie správnosti
3. **FINAL_SUMMARY_PRIJEMCOVIA.txt** - Quick reference

---

**Úspech!** 🎉

Teraz viete ako sa pripojiť k databáze a skontrolovať príjemcov platieb!

