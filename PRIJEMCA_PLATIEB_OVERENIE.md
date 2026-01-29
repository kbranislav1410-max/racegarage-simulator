# Overenie Príjemcov Platieb (Payment Receiver Verification)

## ✅ Správna Konfigurácia

Systém **JE UŽ SPRÁVNE NAKONFIGUROVANÝ** podľa požiadaviek:

### Mapovanie Príjemcov

| Metóda Platby | Príjemca | Databáza | Status |
|---------------|----------|----------|--------|
| **Poukaz - partner** | 🟢 **JA (ME)** | `receiver: "ME"` | ✅ Správne |
| **Poukaz - Racegarage** | 🟢 **JA (ME)** | `receiver: "ME"` | ✅ Správne |
| **PD Drive Club** | 🔵 **KAMARÁT (FRIEND)** | `receiver: "FRIEND"` | ✅ Správne |
| **Poukaz - PD Drive Club** | 🔵 **KAMARÁT (FRIEND)** | `receiver: "FRIEND"` | ✅ Správne |

---

## 📍 Kde Je To Nakonfigurované

### 1. API Route (Backend)

**Súbor:** `/src/app/api/rides/route.ts`  
**Riadky:** 177-182

```typescript
// Map payment method to receiver
let receiver: "ME" | "FRIEND";
if (data.paymentMethod === "PD_DRIVE_CLUB" || data.paymentMethod === "VOUCHER_PD_DRIVE_CLUB") {
  receiver = "FRIEND";  // Kamarát
} else {
  receiver = "ME";      // Ja (VOUCHER_PARTNER, VOUCHER_RACEGARAGE)
}
```

**Logika:**
- Ak metóda je `PD_DRIVE_CLUB` alebo `VOUCHER_PD_DRIVE_CLUB` → `FRIEND`
- Inak (všetky ostatné) → `ME`

### 2. UI Labels (Frontend)

**Súbor:** `/src/app/payments/page.tsx`  
**Riadky:** 105-108

```typescript
const getMethodLabel = (method: string) => {
  const labels: { [key: string]: string } = {
    PD_DRIVE_CLUB: "PD Drive club (→ Kamarát)",
    VOUCHER_PARTNER: "Poukaz - partner (→ Ja)",
    VOUCHER_RACEGARAGE: "Poukaz - Racegarage (→ Ja)",
    VOUCHER_PD_DRIVE_CLUB: "Poukaz - PD Drive Club (→ Kamarát)",
  };
  return labels[method] || method.replace(/_/g, " ");
};
```

**Popisky správne zobrazujú príjemcu:**
- `(→ Ja)` = ME
- `(→ Kamarát)` = FRIEND

---

## 🔍 Ako Overiť Správnosť

### Test 1: Vytvoriť Novú Platbu

**Krok 1: Otvoriť Jazdy**
```
Dashboard → Jazdy → Pridať jazdu
```

**Krok 2: Vytvoriť jazdu s platbou "Poukaz - partner"**
```
Zákazník: [vyberte]
Dátum: Dnes
Čas: 14:00
Suma (€): 30.00
Metóda platby: Poukaz - partner
Partner: Zľavomat
Číslo poukazu: TEST-001
Minúty: 30
→ Zaznamenať
```

**Krok 3: Overiť v sekcii Platby**
```
Platby → Mali by ste vidieť:
- Metóda: "Poukaz - partner (→ Ja)"
- Príjemca: Zelený odznak "→ Ja"
- Me Total sa zvýšil o 30.00€
```

### Test 2: Všetky Metódy

| Test | Metóda | Expected Receiver | Expected Badge |
|------|--------|-------------------|----------------|
| 1 | PD Drive Club | → Kamarát | 🔵 Modrý |
| 2 | Poukaz - partner | → Ja | 🟢 Zelený |
| 3 | Poukaz - Racegarage | → Ja | 🟢 Zelený |
| 4 | Poukaz - PD Drive Club | → Kamarát | 🔵 Modrý |

---

## 🗄️ Overenie v Databáze

### Použitie Prisma Studio

```bash
# 1. Spustiť Prisma Studio
npx prisma studio

# 2. Otvoriť tabuľku "PaymentRecord"

# 3. Pozrieť stĺpce:
#    - method: VOUCHER_PARTNER, VOUCHER_RACEGARAGE, PD_DRIVE_CLUB, VOUCHER_PD_DRIVE_CLUB
#    - receiver: "ME" alebo "FRIEND"

# 4. Overiť mapovanie:
#    VOUCHER_PARTNER → receiver: "ME" ✅
#    VOUCHER_RACEGARAGE → receiver: "ME" ✅
#    PD_DRIVE_CLUB → receiver: "FRIEND" ✅
#    VOUCHER_PD_DRIVE_CLUB → receiver: "FRIEND" ✅
```

### SQL Query

```sql
-- Zobraziť všetky platby s metódou a príjemcom
SELECT 
  id,
  method,
  receiver,
  amountCents / 100.0 as amountEur,
  createdAt
FROM PaymentRecord
ORDER BY createdAt DESC
LIMIT 20;

-- Overenie mapov Mania
SELECT 
  method,
  receiver,
  COUNT(*) as count
FROM PaymentRecord
GROUP BY method, receiver
ORDER BY method;

-- Expected output:
-- PD_DRIVE_CLUB       | FRIEND | X
-- VOUCHER_PARTNER     | ME     | X
-- VOUCHER_RACEGARAGE  | ME     | X
-- VOUCHER_PD_DRIVE_CLUB | FRIEND | X
```

---

## 📊 Vizuálny Prehľad

### Stránka Platby (Správne Zobrazenie)

```
┌─────────────────────────────────────────────────────┐
│  História platieb                                   │
├─────────────────────────────────────────────────────┤
│  Dátum    │ Zákazník │ Suma  │ Metóda            │ Príjemca │
├───────────┼──────────┼───────┼───────────────────┼──────────┤
│ 28.1.2026 │ Novák M. │ 30€   │ Poukaz - partner  │ 🟢 → Ja  │
│           │          │       │ (→ Ja)            │          │
├───────────┼──────────┼───────┼───────────────────┼──────────┤
│ 28.1.2026 │ Horák P. │ 25€   │ PD Drive club     │ 🔵 → Kam.│
│           │          │       │ (→ Kamarát)       │          │
├───────────┼──────────┼───────┼───────────────────┼──────────┤
│ 27.1.2026 │ Tóth J.  │ 20€   │ Poukaz - Racegarage│ 🟢 → Ja │
│           │          │       │ (→ Ja)            │          │
├───────────┼──────────┼───────┼───────────────────┼──────────┤
│ 27.1.2026 │ Nagy S.  │ 35€   │ Poukaz - PD Drive │ 🔵 → Kam.│
│           │          │       │ Club (→ Kamarát)  │          │
└───────────┴──────────┴───────┴───────────────────┴──────────┘
```

### Súhrnné Karty

```
┌──────────────────────┐  ┌──────────────────────┐
│  Celkom pre mňa      │  │ Celkom pre kamaráta  │
│  (ME Total)          │  │ (FRIEND Total)       │
├──────────────────────┤  ├──────────────────────┤
│  Poukaz - partner    │  │ PD Drive Club        │
│  Poukaz - Racegarage │  │ Poukaz - PD Drive Club│
│                      │  │                      │
│  €50.00              │  │ €60.00               │
│  🟢 Zelený           │  │ 🔵 Modrý             │
└──────────────────────┘  └──────────────────────┘
```

---

## ❓ FAQ

### Q: Prečo sa mi zobrazujú nesprávni príjemcovia?

**A: Možné príčiny:**

1. **Staré záznamy v databáze** (pred commit 7ea0f22)
   - Riešenie: Vytvoriť nové platby po aktualizácii

2. **Cache v prehliadači**
   - Riešenie: Hard refresh (Ctrl+Shift+R)

3. **Neaktualizovaný kód**
   - Riešenie: `git pull` a `npm run dev`

### Q: Ako opraviť staré záznamy?

**A: SQL update query:**

```sql
-- Opraviť receiver pre všetky PD_DRIVE_CLUB
UPDATE PaymentRecord
SET receiver = 'FRIEND'
WHERE method = 'PD_DRIVE_CLUB';

-- Opraviť receiver pre všetky VOUCHER_PD_DRIVE_CLUB
UPDATE PaymentRecord
SET receiver = 'FRIEND'
WHERE method = 'VOUCHER_PD_DRIVE_CLUB';

-- Opraviť receiver pre všetky VOUCHER_PARTNER
UPDATE PaymentRecord
SET receiver = 'ME'
WHERE method = 'VOUCHER_PARTNER';

-- Opraviť receiver pre všetky VOUCHER_RACEGARAGE
UPDATE PaymentRecord
SET receiver = 'ME'
WHERE method = 'VOUCHER_RACEGARAGE';
```

**Alebo cez Prisma Studio:**
1. Otvoriť `PaymentRecord` tabuľku
2. Filtrovať podľa `method`
3. Manuálne upraviť `receiver` hodnotu
4. Uložiť

### Q: Kde vidím kto je príjemca?

**A: 3 miesta:**

1. **Stránka Platby** - Stĺpec "Príjemca" s farebným odznakom
2. **Metóda platby** - V zátvorkách "(→ Ja)" alebo "(→ Kamarát)"
3. **Súhrnné karty** - "Me Total" vs "Friend Total"

---

## 🎯 Zhrnutie

### ✅ Čo JE Správne

- Kód je správne nakonfigurovaný
- API mapuje príjemcov správne
- UI zobrazuje správne popisky
- Nové platby budú mať správneho príjemcu

### ⚠️ Možné Problémy

- Staré záznamy v DB (pred fix commit)
- Cache v prehliadači
- Neaktualizovaný kód

### 🔧 Riešenie

1. **Overiť commit:**
   ```bash
   git log --oneline -1
   # Malo by byť 4884aca alebo novšie
   ```

2. **Vytvoriť test platbu:**
   - Použiť každú metódu platby
   - Overiť príjemcu v stĺpci "Príjemca"

3. **Ak stále nesprávne:**
   - Skontrolovať databázu cez Prisma Studio
   - Opraviť staré záznamy SQL query
   - Reštartovať aplikáciu

---

## 📚 Súvisiace Commity

| Commit | Popis | Dátum |
|--------|-------|-------|
| 7ea0f22 | CRITICAL FIX: Payment validation schema | 28.1.2026 |
| 8ca5d2c | Fix payments UI badge mapping | 28.1.2026 |
| f945a57 | Fix dashboard payment methods | 28.1.2026 |
| d4cf911 | Update ride form - remove source | 28.1.2026 |

---

**Status:** ✅ Systém je správne nakonfigurovaný!  
**Verifikácia:** Použiť testovacie scenáre vyššie  
**Podpora:** Pozrieť FAQ pre riešenie problémov
