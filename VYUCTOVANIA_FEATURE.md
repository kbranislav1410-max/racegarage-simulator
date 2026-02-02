# Vyúčtovania (Settlements) - Kompletná Dokumentácia

## Úvod

Funkcia **Vyúčtovania** slúži na mesačné evidovanie príjmov, vytváranie faktúr a sledovanie ich stavu. Systém automaticky vypočíta kto komu dlhuje na základe 50/50 rozdelenia príjmov medzi PD Drive Club a Racegarage.

### Účel
- 📊 Mesačná evidencia príjmov
- 📄 Sledovanie faktúr a ich stavu
- 💰 Automatický výpočet vyúčtovania (kto komu dlhuje)
- ✅ Kontrola úhrad

---

## Prehľad Funkcionality

### Čo Systém Vie

1. **Automatické Výpočty**
   - Celková suma za mesiac
   - Suma pre PD Drive Club (FRIEND receiver)
   - Suma pre Racegarage (ME receiver)
   - 50/50 vyúčtovanie

2. **Status Management**
   - Nevyfakturované
   - Poslaná faktúra
   - Zaplatená faktúra

3. **Sledovanie**
   - Číslo faktúry
   - Dátum vystavenia faktúry
   - Dátum úhrady
   - Poznámky

---

## Ako To Používať

### 1. Vytvorenie Vyúčtovania

**Krok 1:** Otvorte stránku Vyúčtovania
- V sidebar kliknite na "Vyúčtovania" (pod Platby)

**Krok 2:** Vytvorte nové vyúčtovanie
```
1. Kliknite tlačidlo "+ Vytvoriť vyúčtovanie"
2. Vyberte rok (napr. 2024)
3. Vyberte mesiac (napr. Január)
4. Kliknite "Vytvoriť"
```

**Čo sa stane:**
- Systém načíta všetky platby z daného mesiaca
- Automaticky vypočíta všetky sumy
- Vytvorí záznam so statusom "Nevyfakturované"

### 2. Zmena Statusu

**Postup:**
```
1. V tabuľke nájdite vyúčtovanie
2. Kliknite "Zmeniť stav"
3. Vyberte nový status
4. Kliknite "Uložiť"
```

**Automatické Akcie:**
- Pri zmene na "Poslaná faktúra":
  - Vygeneruje sa číslo faktúry (napr. 202401001)
  - Nastaví sa dátum vystavenia

- Pri zmene na "Zaplatená faktúra":
  - Nastaví sa dátum úhrady

### 3. Zmazanie Vyúčtovania

```
1. Nájdite vyúčtovanie v tabuľke
2. Kliknite "Zmazať"
3. Potvrďte akciu
```

⚠️ **Upozornenie:** Mazanie je trvalé!

---

## UI Vysvetlenie

### Hlavná Stránka

```
┌────────────────────────────────────────────────────────────┐
│ Vyúčtovania                                                │
│ Mesačné vyúčtovania a faktúry                              │
├────────────────────────────────────────────────────────────┤
│ [+ Vytvoriť vyúčtovanie] [2024 ▼] [Všetky stavy ▼]        │
└────────────────────────────────────────────────────────────┘
```

**Elementy:**
- `+ Vytvoriť vyúčtovanie` - Tlačidlo na vytvorenie nového vyúčtovania
- `[2024 ▼]` - Filter podľa roku
- `[Všetky stavy ▼]` - Filter podľa statusu

### Tabuľka Vyúčtovaní

```
┌─────────┬──────────┬─────────────────────┬────────────┬─────────┬────────┐
│ Mesiac  │ Celková  │ Vyúčtovanie         │ Status     │ Faktúra │ Akcie  │
│         │ suma     │                     │            │ č.      │        │
├─────────┼──────────┼─────────────────────┼────────────┼─────────┼────────┤
│ Január  │ €150.00  │ PD Drive Club mi    │ 🟢 Zapl.   │ #202401 │ Zmeniť │
│ 2024    │          │ dlhuje €25.00       │            │         │ Zmazať │
│         │ PD: €100 │                     │            │         │        │
│         │ RG: €50  │                     │            │         │        │
└─────────┴──────────┴─────────────────────┴────────────┴─────────┴────────┘
```

**Stĺpce:**

1. **Mesiac**
   - Názov mesiaca a rok
   - Napr. "Január 2024"

2. **Celková suma**
   - Prvý riadok: Celková suma za mesiac
   - Druhý riadok: Detaily (PD: X, RG: Y)

3. **Vyúčtovanie**
   - Zelené: "PD Drive Club mi dlhuje €X"
   - Červené: "Racegarage dlhuje €X"
   - Sivé: "Vyrovnané"

4. **Status**
   - 🟡 Nevyfakturované (žltý odznak)
   - 🔵 Poslaná faktúra (modrý odznak)
   - 🟢 Zaplatená faktúra (zelený odznak)

5. **Faktúra č.**
   - Číslo faktúry (ak existuje)
   - `-` ak ešte nebola vytvorená

6. **Akcie**
   - "Zmeniť stav" - Aktualizovať status
   - "Zmazať" - Vymazať vyúčtovanie

---

## Status Workflow

### 3 Stavy Vyúčtovania

```
1. Nevyfakturované (NOT_INVOICED)
   ↓
   [Zmeniť stav → Poslaná faktúra]
   ↓
2. Poslaná faktúra (INVOICE_SENT)
   - Auto-generate: invoice number
   - Auto-set: invoice date
   ↓
   [Zmeniť stav → Zaplatená faktúra]
   ↓
3. Zaplatená faktúra (PAID)
   - Auto-set: paid date
   ✓ HOTOVO
```

### Status Význam

**1. Nevyfakturované**
- Vyúčtovanie bolo vytvorené
- Faktúra ešte nebola vystavená
- Čakáme na koniec mesiaca

**2. Poslaná faktúra**
- Faktúra bola vystavená
- Faktúra bola odoslaná partnerovi
- Čakáme na platbu

**3. Zaplatená faktúra**
- Platba bola prijatá
- Vyúčtovanie je uzavreté
- Všetko v poriadku ✓

---

## Automatické Výpočty

### Ako Systém Počíta

**Vstup:**
- Všetky platby (PaymentRecord) za daný mesiac
- Každá platba má receiver: FRIEND alebo ME

**Výpočet:**

```typescript
// 1. Celková suma
totalAmount = SUM(všetky platby)

// 2. Suma pre PD Drive Club
friendAmount = SUM(platby kde receiver = FRIEND)

// 3. Suma pre Racegarage
meAmount = SUM(platby kde receiver = ME)

// 4. 50/50 Vyúčtovanie
settlement = (friendAmount - meAmount) / 2
```

**Interpretácia:**
- `settlement > 0` → PD Drive Club mi dlhuje
- `settlement < 0` → Racegarage dlhuje PD Drive Club
- `settlement = 0` → Vyrovnané

### Príklad 1: PD Drive Club Dlhuje

```
Január 2024:
- Celkom inkasované: €300
- PD Drive Club (FRIEND): €200
- Racegarage (ME): €100

Výpočet vyúčtovania:
(200 - 100) / 2 = €50

Výsledok:
"PD Drive Club mi dlhuje €50.00"
```

### Príklad 2: Racegarage Dlhuje

```
Február 2024:
- Celkom inkasované: €250
- PD Drive Club (FRIEND): €80
- Racegarage (ME): €170

Výpočet vyúčtovania:
(80 - 170) / 2 = -€45

Výsledok:
"Racegarage dlhuje PD Drive Club €45.00"
```

### Príklad 3: Vyrovnané

```
Marec 2024:
- Celkom inkasované: €200
- PD Drive Club (FRIEND): €100
- Racegarage (ME): €100

Výpočet vyúčtovania:
(100 - 100) / 2 = €0

Výsledok:
"Vyrovnané"
```

---

## API Dokumentácia

### Endpoints

#### 1. GET /api/settlements

**Popis:** Získať zoznam vyúčtovaní

**Query Parameters:**
- `year` - Filter podľa roku (optional)
- `status` - Filter podľa statusu (optional)

**Response:**
```json
[
  {
    "id": "clxxx123",
    "year": 2024,
    "month": 1,
    "status": "PAID",
    "totalAmountCents": 15000,
    "friendAmountCents": 10000,
    "meAmountCents": 5000,
    "settlementCents": 2500,
    "invoiceNumber": "202401001",
    "invoiceDate": "2024-02-01T10:00:00Z",
    "paidDate": "2024-02-15T14:30:00Z",
    "notes": null,
    "createdAt": "2024-02-01T09:00:00Z",
    "updatedAt": "2024-02-15T14:30:00Z"
  }
]
```

#### 2. POST /api/settlements

**Popis:** Vytvoriť nové vyúčtovanie

**Request Body:**
```json
{
  "year": 2024,
  "month": 1
}
```

**Response:**
```json
{
  "id": "clxxx123",
  "year": 2024,
  "month": 1,
  "status": "NOT_INVOICED",
  "totalAmountCents": 15000,
  ...
}
```

#### 3. GET /api/settlements/[id]

**Popis:** Získať detail vyúčtovania + platby za mesiac

**Response:**
```json
{
  "settlement": { ... },
  "payments": [ ... ]
}
```

#### 4. PATCH /api/settlements/[id]

**Popis:** Aktualizovať vyúčtovanie

**Request Body:**
```json
{
  "status": "INVOICE_SENT",
  "notes": "Faktúra odoslaná emailom"
}
```

#### 5. DELETE /api/settlements/[id]

**Popis:** Zmazať vyúčtovanie

---

## Database Schema

### MonthlySettlement Model

```prisma
model MonthlySettlement {
  id                 String            @id @default(cuid())
  year               Int
  month              Int               // 1-12
  status             SettlementStatus  @default(NOT_INVOICED)
  totalAmountCents   Int               // Celková suma
  friendAmountCents  Int               // Suma pre PD Drive Club
  meAmountCents      Int               // Suma pre Racegarage
  settlementCents    Int               // Vyúčtovanie (+ = friend dlhuje)
  invoiceNumber      String?           @unique
  invoiceDate        DateTime?
  paidDate           DateTime?
  notes              String?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  @@unique([year, month])
  @@map("monthly_settlements")
}

enum SettlementStatus {
  NOT_INVOICED    // Nevyfakturované
  INVOICE_SENT    // Poslaná faktúra
  PAID            // Zaplatená faktúra
}
```

**Kľúčové Vlastnosti:**
- `@@unique([year, month])` - Len jedno vyúčtovanie na mesiac
- `settlementCents` - Kladné = friend dlhuje, záporné = ja dlhujem
- `invoiceNumber` - Unikátne číslo faktúry

---

## Príklady Použitia

### Scenár 1: Koniec Mesiaca

**Situácia:** Je 1. február 2024, chcete vytvoriť vyúčtovanie za január

**Kroky:**
```
1. Otvorte Vyúčtovania
2. Kliknite "+ Vytvoriť vyúčtovanie"
3. Rok: 2024
4. Mesiac: Január
5. Kliknite "Vytvoriť"

Výsledok:
- Systém načítal všetky platby z 1.1.2024 - 31.1.2024
- Vypočítal sumy:
  - Celkom: €280
  - PD Drive Club: €180
  - Racegarage: €100
- Vyúčtovanie: PD Drive Club mi dlhuje €40
- Status: Nevyfakturované
```

### Scenár 2: Odoslanie Faktúry

**Situácia:** Vytvorili ste faktúru a odoslali ju partnerovi

**Kroky:**
```
1. Nájdite vyúčtovanie v tabuľke
2. Kliknite "Zmeniť stav"
3. Vyberte "Poslaná faktúra"
4. Kliknite "Uložiť"

Výsledok:
- Status zmenený na "Poslaná faktúra" 🔵
- Automaticky vygenerované číslo faktúry: #202401001
- Dátum vystavenia: 2024-02-05
```

### Scenár 3: Prijatie Platby

**Situácia:** Partner zaplatil faktúru

**Kroky:**
```
1. Nájdite vyúčtovanie v tabuľke
2. Kliknite "Zmeniť stav"
3. Vyberte "Zaplatená faktúra"
4. Kliknite "Uložiť"

Výsledok:
- Status zmenený na "Zaplatená faktúra" 🟢
- Automaticky nastavený dátum úhrady: 2024-02-15
- Vyúčtovanie uzavreté ✓
```

---

## FAQ

### 1. Môžem vytvoriť viacero vyúčtovaní pre jeden mesiac?

**Nie.** Systém povoľuje len jedno vyúčtovanie na mesiac. Ak sa pokúsite vytvoriť duplicitné vyúčtovanie, dostanete chybu.

### 2. Čo ak sa zmení suma v platbách po vytvorení vyúčtovania?

Vyúčtovanie je "snapshot" stavu v čase vytvorenia. Ak sa zmenia platby (pridajú, zmažú), musíte:
1. Zmazať staré vyúčtovanie
2. Vytvoriť nové vyúčtovanie

### 3. Ako sa generuje číslo faktúry?

Formát: `YYYYMMNNN`
- `YYYY` - Rok (2024)
- `MM` - Mesiac (01-12)
- `NNN` - Poradové číslo (001, 002, ...)

Príklad: `202401001` = Január 2024, faktúra č. 1

### 4. Môžem zmeniť status späť (napr. z PAID na INVOICE_SENT)?

**Áno**, môžete meniť status kedykoľvek. Systém neumožňuje automatické zmeny, len manuálne.

### 5. Čo znamená "Vyrovnané"?

Znamená to že PD Drive Club a Racegarage inkasovali rovnaké sumy. Po 50/50 rozdelení nikto nikomu nedlhuje.

### 6. Kde vidím detaily platieb pre daný mesiac?

V budúcej verzii bude možné kliknúť na vyúčtovanie a zobraziť všetky platby za daný mesiac. Momentálne môžete použiť stránku Platby s filtrom podľa mesiaca.

### 7. Môžem pridať poznámky k vyúčtovaniu?

**Áno**, hoci to nie je implementované v UI. Môžete to urobiť cez API:

```javascript
PATCH /api/settlements/[id]
{
  "notes": "Vaša poznámka"
}
```

### 8. Čo sa stane ak zmažem vyúčtovanie s faktúrou?

Záznam sa permanentne zmaže z databázy. **Neodporúčame** mazať vyúčtovania ktoré majú už vystavenú faktúru. Radšej zmeňte status alebo pridajte poznámku.

---

## Zhrnutie

### Kľúčové Vlastnosti

✅ **Automatické výpočty** - Systém sám vypočíta všetky sumy  
✅ **Status tracking** - 3 stavy pre sledovanie faktúr  
✅ **50/50 rozdelenie** - Fair vyúčtovanie medzi partnermi  
✅ **Prehľadná tabuľka** - Všetko na jednom mieste  
✅ **Filtre** - Rýchle vyhľadávanie podľa roku/statusu  

### Workflow

```
1. Koniec mesiaca
   ↓
2. Vytvoriť vyúčtovanie (automatický výpočet)
   ↓
3. Vystaviť faktúru → Zmeniť status na "Poslaná faktúra"
   ↓
4. Dostať platbu → Zmeniť status na "Zaplatená faktúra"
   ↓
5. HOTOVO ✓
```

---

**Verzia:** 1.0  
**Vytvorené:** 28.1.2026  
**Status:** Production Ready 🚀
