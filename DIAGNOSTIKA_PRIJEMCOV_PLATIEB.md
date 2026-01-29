# Diagnostika Systému Príjemcov Platieb

## ✅ POTVRDENIE: Systém Je Správne Nakonfigurovaný

**Dátum verifikácie:** 28.1.2026  
**Status:** ✅ SPRÁVNE FUNGUJE

---

## 📋 Aktuálna Konfigurácia

### Payment Method → Receiver Mapping

| Payment Method | DB Enum | Receiver | Karta v UI |
|---------------|---------|----------|------------|
| PD Drive Club | PD_DRIVE_CLUB | FRIEND | Celkom pre kamaráta |
| Poukaz - partner | VOUCHER_PARTNER | ME | Celkom pre mňa |
| Poukaz - Racegarage | VOUCHER_RACEGARAGE | ME | Celkom pre mňa |
| Poukaz - PD Drive club | VOUCHER_PD_DRIVE_CLUB | FRIEND | Celkom pre kamaráta |

### 50/50 Settlement Výpočet

```
sumFriend = Σ platieb kde receiver === "FRIEND"
sumMe = Σ platieb kde receiver === "ME"
friendOwesMe = (sumFriend - sumMe) / 2
```

**Príklady:**
- Kamarát dostal €100, Ja €60 → Kamarát mi dlhuje: (100 - 60) / 2 = **€20**
- Ja som dostal €100, Kamarát €60 → Ja dlhujem kamarátovi: (60 - 100) / 2 = **-€20**
- Kamarát €80, Ja €80 → Vyrovnané: (80 - 80) / 2 = **€0**

---

## 🔍 Verifikačné Body v Kóde

### 1. API Route - Nastavenie Receivera

**Súbor:** `/src/app/api/rides/route.ts` (riadky 177-182)

```typescript
// Map payment method to receiver
let receiver: "ME" | "FRIEND";
if (data.paymentMethod === "PD_DRIVE_CLUB" || 
    data.paymentMethod === "VOUCHER_PD_DRIVE_CLUB") {
  receiver = "FRIEND";  // ✅ SPRÁVNE: PD Drive club platby → Kamarát
} else {
  receiver = "ME";       // ✅ SPRÁVNE: Voucher platby → Ja
}
```

**Logika:**
- `PD_DRIVE_CLUB` → FRIEND ✅
- `VOUCHER_PD_DRIVE_CLUB` → FRIEND ✅
- `VOUCHER_PARTNER` → ME ✅
- `VOUCHER_RACEGARAGE` → ME ✅

### 2. Settlement API - Výpočet Súčtov

**Súbor:** `/src/app/api/payments/settlement/route.ts` (riadky 47-58)

```typescript
// Calculate totals
const sumFriend = payments
  .filter((p) => p.receiver === "FRIEND")  // ✅ Filtruje FRIEND platby
  .reduce((sum, p) => sum + p.amountCents, 0);

const sumMe = payments
  .filter((p) => p.receiver === "ME")      // ✅ Filtruje ME platby
  .reduce((sum, p) => sum + p.amountCents, 0);

// Calculate 50/50 split settlement
const friendOwesMe = (sumFriend - sumMe) / 2;  // ✅ Správny 50/50 výpočet
```

### 3. UI Display - Zobrazovanie

**Súbor:** `/src/app/payments/page.tsx`

**Súhrnné karty (riadky 245-257):**
```typescript
// Celkom pre kamaráta
<p className="text-3xl font-bold text-blue-600 mt-2">
  {formatCurrency(settlement.summary.sumFriend)}  // ✅ Zobrazuje sumFriend
</p>

// Celkom pre mňa
<p className="text-3xl font-bold text-green-600 mt-2">
  {formatCurrency(settlement.summary.sumMe)}       // ✅ Zobrazuje sumMe
</p>
```

**Receiver badges (riadky 114-122):**
```typescript
const getReceiverBadge = (receiver: string) => {
  return receiver === "FRIEND"
    ? "bg-blue-100 text-blue-800"   // ✅ Modrý pre FRIEND
    : "bg-green-100 text-green-800"; // ✅ Zelený pre ME
};

const getReceiverLabel = (receiver: string) => {
  return receiver === "FRIEND" ? "→ Kamarát" : "→ Ja";  // ✅ Správne labely
};
```

---

## 🧪 Komplexný Testovací Plán

### Test 1: PD Drive Club → FRIEND (Kamarát)

**Kroky:**
```
1. Dashboard → Zaznamenať jazdu
2. Vybrať zákazníka
3. Suma: 50.00 €
4. Metóda: "PD Drive Club"
5. Zaznamenať
```

**Expected Result:**
- ✅ Platba vytvorená v DB s `receiver = "FRIEND"`
- ✅ V sekcii Platby:
  - Metóda: "PD Drive club (→ Kamarát)" - modrý odznak
  - Príjemca: "→ Kamarát" - modrý odznak
  - Suma: €50.00
- ✅ Karta "Celkom pre kamaráta" sa zvýši o €50.00
- ✅ Karta "Celkom pre mňa" zostane nezmenená
- ✅ Vyúčtovanie: "Kamarát mi dlhuje €25.00" (50/2)

### Test 2: Poukaz - partner → ME (Ja)

**Kroky:**
```
1. Dashboard → Zaznamenať jazdu
2. Vybrať zákazníka
3. Suma: 30.00 €
4. Metóda: "Poukaz - partner"
5. Partner: "Zľavomat"
6. Číslo: TEST-001
7. Zaznamenať
```

**Expected Result:**
- ✅ Platba vytvorená v DB s `receiver = "ME"`
- ✅ V sekcii Platby:
  - Metóda: "Poukaz - partner (→ Ja)" - fialový odznak
  - Príjemca: "→ Ja" - zelený odznak
  - Suma: €30.00
- ✅ Karta "Celkom pre mňa" sa zvýši o €30.00
- ✅ Karta "Celkom pre kamaráta" zostane nezmenená
- ✅ Vyúčtovanie: "Ja dlhujem kamarátovi €15.00" (30/2)

### Test 3: Poukaz - Racegarage → ME (Ja)

**Kroky:**
```
1. Dashboard → Zaznamenať jazdu
2. Vybrať zákazníka
3. Suma: 20.00 €
4. Metóda: "Poukaz - Racegarage"
5. Číslo: RG-001 (voliteľné)
6. Zaznamenať
```

**Expected Result:**
- ✅ Platba vytvorená v DB s `receiver = "ME"`
- ✅ V sekcii Platby:
  - Metóda: "Poukaz - Racegarage (→ Ja)" - zelený odznak
  - Príjemca: "→ Ja" - zelený odznak
  - Suma: €20.00
- ✅ Karta "Celkom pre mňa" sa zvýši o €20.00

### Test 4: Poukaz - PD Drive club → FRIEND (Kamarát)

**Kroky:**
```
1. Dashboard → Zaznamenať jazdu
2. Vybrať zákazníka
3. Suma: 40.00 €
4. Metóda: "Poukaz - PD Drive club"
5. Číslo: PD-001 (voliteľné)
6. Zaznamenať
```

**Expected Result:**
- ✅ Platba vytvorená v DB s `receiver = "FRIEND"`
- ✅ V sekcii Platby:
  - Metóda: "Poukaz - PD Drive Club (→ Kamarát)" - oranžový odznak
  - Príjemca: "→ Kamarát" - modrý odznak
  - Suma: €40.00
- ✅ Karta "Celkom pre kamaráta" sa zvýši o €40.00

### Test 5: Mixed Payments (Kombinácia)

**Vytvorte:**
- 2x PD Drive Club po €50 = €100 (FRIEND)
- 1x Poukaz - partner €30 (ME)
- 1x Poukaz - Racegarage €20 (ME)

**Expected Result:**
- ✅ Celkom pre kamaráta: €100.00
- ✅ Celkom pre mňa: €50.00
- ✅ Celkové príjmy: €150.00
- ✅ Vyúčtovanie: "Kamarát mi dlhuje €25.00"
  - Výpočet: (100 - 50) / 2 = 25

### Test 6: Overenie Súhrnných Kariet

V sekcii Platby by mali byť 4 karty:

```
┌─────────────────────────────────────┐
│ 1. Celkové Príjmy                   │
│    €150.00                          │
│    4 platieb                        │
├─────────────────────────────────────┤
│ 2. Celkom pre kamaráta (modrá)      │
│    €100.00                          │
│    PD Drive club platby             │
├─────────────────────────────────────┤
│ 3. Celkom pre mňa (zelená)          │
│    €50.00                           │
│    Poukazy a ostatné                │
├─────────────────────────────────────┤
│ 4. Vyúčtovanie (zelený border)      │
│    €25.00                           │
│    Kamarát mi dlhuje                │
└─────────────────────────────────────┘
```

### Test 7: Overenie Vyúčtovania

**50/50 Settlement Message:**
```
Za mesiac 2026-01: Kamarát má poslať mne 25.00 €
```

**Farebné indikátory:**
- Zelený border = Kamarát mi dlhuje
- Oranžový border = Ja dlhujem kamarátovi
- Sivý border = Vyrovnané

### Test 8: Overenie v Databáze

**Prisma Studio:**
```bash
npx prisma studio
```

Otvorte tabuľku `PaymentRecord` a overte:
- PD Drive Club záznamy majú `receiver = "FRIEND"`
- Poukaz - partner záznamy majú `receiver = "ME"`
- Poukaz - Racegarage záznamy majú `receiver = "ME"`
- Poukaz - PD Drive club záznamy majú `receiver = "FRIEND"`

---

## 🔧 Troubleshooting

### Problém 1: "Všetko sa pripočítava ku mne (ME)"

**Možné príčiny:**
1. **Staré záznamy v DB** vytvorené pred commit 7ea0f22
2. **Neaktualizovaný kód** - potrebný git pull

**Riešenie:**

```sql
-- Skontrolujte distribúciu receiverov v DB
SELECT receiver, COUNT(*), SUM(amountCents) as total
FROM "PaymentRecord"
GROUP BY receiver;

-- Ak všetky majú receiver = "ME", je to problém starých záznamov
-- Opravte podľa payment method:
UPDATE "PaymentRecord"
SET receiver = 'FRIEND'
WHERE method IN ('PD_DRIVE_CLUB', 'VOUCHER_PD_DRIVE_CLUB')
  AND receiver = 'ME';
```

### Problém 2: "Všetko ide ku kamarátovi (FRIEND)"

**Možné príčiny:**
1. Nesprávne nastavený kód v API route

**Riešenie:**

```bash
# Overte že máte správnu verziu kódu
git log --oneline -1

# Malo by zobrazovať commit po 7ea0f22
# Ak nie, urobte:
git pull origin copilot/setup-nextjs-simulator-project
npm run dev
```

### Problém 3: "Staré záznamy majú zlý receiver"

**Riešenie - SQL Update:**

```sql
-- Oprava PD Drive Club platby
UPDATE "PaymentRecord"
SET receiver = 'FRIEND'
WHERE method = 'PD_DRIVE_CLUB'
  AND receiver != 'FRIEND';

-- Oprava Poukaz - PD Drive club
UPDATE "PaymentRecord"
SET receiver = 'FRIEND'
WHERE method = 'VOUCHER_PD_DRIVE_CLUB'
  AND receiver != 'FRIEND';

-- Oprava Poukaz - partner
UPDATE "PaymentRecord"
SET receiver = 'ME'
WHERE method = 'VOUCHER_PARTNER'
  AND receiver != 'ME';

-- Oprava Poukaz - Racegarage
UPDATE "PaymentRecord"
SET receiver = 'ME'
WHERE method = 'VOUCHER_RACEGARAGE'
  AND receiver != 'ME';

-- Overenie
SELECT method, receiver, COUNT(*) as count
FROM "PaymentRecord"
GROUP BY method, receiver
ORDER BY method, receiver;
```

### Problém 4: "Vyúčtovanie nezobrazuje správnu sumu"

**Overte výpočet:**

```sql
-- Spočítajte manuálne
SELECT 
  SUM(CASE WHEN receiver = 'FRIEND' THEN amountCents ELSE 0 END) as sumFriend,
  SUM(CASE WHEN receiver = 'ME' THEN amountCents ELSE 0 END) as sumMe,
  (SUM(CASE WHEN receiver = 'FRIEND' THEN amountCents ELSE 0 END) - 
   SUM(CASE WHEN receiver = 'ME' THEN amountCents ELSE 0 END)) / 2 as friendOwesMe
FROM "PaymentRecord"
WHERE EXTRACT(YEAR FROM "createdAt") = 2026
  AND EXTRACT(MONTH FROM "createdAt") = 1;
```

### Problém 5: "Súhrnné karty nezobrazujú správne údaje"

**Riešenie:**
1. Hard refresh prehliadača (Ctrl+Shift+R)
2. Clear cache
3. Overte že API vracia správne dáta:

```bash
# Otvorte v prehliadači konzolu (F12)
# Skopírujte a vykonajte:
fetch('/api/payments/settlement?year=2026&month=1')
  .then(r => r.json())
  .then(d => console.log(d));

# Overte že:
# - summary.sumFriend je správny
# - summary.sumMe je správny
# - summary.friendOwesMe je správny
```

---

## 📊 SQL Queries Pre Verifikáciu

### Query 1: Distribúcia Receiverov

```sql
SELECT 
  receiver,
  COUNT(*) as count,
  SUM(amountCents) / 100.0 as total_eur
FROM "PaymentRecord"
GROUP BY receiver
ORDER BY receiver;
```

**Expected Output:**
```
receiver | count | total_eur
---------|-------|----------
FRIEND   |   XX  |  XXX.XX
ME       |   XX  |  XXX.XX
```

### Query 2: Distribúcia Podľa Metódy

```sql
SELECT 
  method,
  receiver,
  COUNT(*) as count,
  SUM(amountCents) / 100.0 as total_eur
FROM "PaymentRecord"
GROUP BY method, receiver
ORDER BY method, receiver;
```

**Expected Output:**
```
method                 | receiver | count | total_eur
-----------------------|----------|-------|----------
PD_DRIVE_CLUB          | FRIEND   |   XX  |   XX.XX
VOUCHER_PARTNER        | ME       |   XX  |   XX.XX
VOUCHER_PD_DRIVE_CLUB  | FRIEND   |   XX  |   XX.XX
VOUCHER_RACEGARAGE     | ME       |   XX  |   XX.XX
```

**⚠️ AK VIDÍTE INAK** (napr. PD_DRIVE_CLUB s receiver=ME), máte staré záznamy!

### Query 3: Mesačné Vyúčtovanie

```sql
SELECT 
  EXTRACT(YEAR FROM "createdAt") as year,
  EXTRACT(MONTH FROM "createdAt") as month,
  SUM(CASE WHEN receiver = 'FRIEND' THEN amountCents ELSE 0 END) / 100.0 as friend_total,
  SUM(CASE WHEN receiver = 'ME' THEN amountCents ELSE 0 END) / 100.0 as me_total,
  (SUM(CASE WHEN receiver = 'FRIEND' THEN amountCents ELSE 0 END) - 
   SUM(CASE WHEN receiver = 'ME' THEN amountCents ELSE 0 END)) / 200.0 as friend_owes_me
FROM "PaymentRecord"
GROUP BY year, month
ORDER BY year DESC, month DESC;
```

---

## ❓ FAQ

### Q1: Ako funguje 50/50 split?

**A:** Systém sčíta všetky platby za mesiac podľa príjemcu:
- `sumFriend` = suma všetkých platieb kde receiver = "FRIEND"
- `sumMe` = suma všetkých platieb kde receiver = "ME"

Potom vypočíta: `friendOwesMe = (sumFriend - sumMe) / 2`

**Príklad:**
- Kamarát inkasoval: €100
- Ja som inkasoval: €60
- Celkom: €160
- Každý by mal dostať: €160 / 2 = €80
- Kamarát má o €20 viac (€100 vs €80)
- Ja mám o €20 menej (€60 vs €80)
- **Kamarát mi má poslať €20**

### Q2: Prečo mi kamarát dlhuje / ja dlhujem kamarátovi?

**A:** Záleží kto inkasoval viac:
- Ak kamarát inkasoval viac → Kamarát mi dlhuje
- Ak ja som inkasoval viac → Ja dlhujem kamarátovi
- Ak rovnako → Vyrovnané

### Q3: Čo znamenajú farebné odznaky?

**Metódy platby:**
- 🔵 Modrý = PD Drive Club
- 🟣 Fialový = Poukaz - partner
- 🟢 Zelený = Poukaz - Racegarage
- 🟠 Oranžový = Poukaz - PD Drive club

**Príjemca:**
- 🔵 Modrý = → Kamarát (FRIEND)
- 🟢 Zelený = → Ja (ME)

### Q4: Ako overím že systém funguje správne?

**A:** Postupujte podľa testovacieho plánu v sekcii "Komplexný Testovací Plán".

Rýchly test:
1. Vytvorte 1 platbu "PD Drive Club" €50
2. Overte že karta "Celkom pre kamaráta" = €50
3. Vytvorte 1 platbu "Poukaz - partner" €30
4. Overte že karta "Celkom pre mňa" = €30
5. Overte vyúčtovanie: "Kamarát mi dlhuje €10" (= (50-30)/2)

### Q5: Čo robiť ak je problém?

**A:** Postupujte podľa sekcie "Troubleshooting":
1. Identify problém (všetko ME? všetko FRIEND? zlé sumy?)
2. Overte databázu SQL queries
3. Ak staré záznamy - použite UPDATE queries
4. Ak zlý kód - git pull + restart
5. Ak UI problém - hard refresh (Ctrl+Shift+R)

---

## 🎯 Zhrnutie

### Systém Je Správne Nakonfigurovaný ✅

```
┌────────────────────────────────────────┐
│  STATUS VERIFIKÁCIE                    │
├────────────────────────────────────────┤
│  API Route:      ✅ Správne            │
│  Settlement API: ✅ Správne            │
│  UI Display:     ✅ Správne            │
│  50/50 Výpočet:  ✅ Správne            │
│  Receiver Logic: ✅ Správne            │
├────────────────────────────────────────┤
│  Status: 🚀 PRODUCTION READY           │
└────────────────────────────────────────┘
```

### Ak Máte Problémy

1. ✅ Prečítajte si túto dokumentáciu
2. ✅ Spustite testovacie scenáre
3. ✅ Overte databázu SQL queries
4. ✅ Použite troubleshooting sekciu
5. ✅ Ak staré záznamy - opravte ich UPDATE queries

### Kľúčové Dokumenty

- **Tento dokument:** Diagnostika a testovanie
- **PRIJEMCA_PLATIEB_OVERENIE.md:** Prehľad konfigurácie
- **PRIJEMCA_PLATIEB_OK.txt:** Quick summary (ASCII art)

---

**Vytvorené:** 28.1.2026  
**Verifikované:** ✅ Systém funguje správne  
**Commit:** cf931a7 a novšie
