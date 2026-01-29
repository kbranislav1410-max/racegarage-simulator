# Zľavové Portály - Vizuálny Prehľad

## 📊 Architektúra Systému

```
┌─────────────────────────────────────────────────────────────────┐
│                        RACEGARAGE SIMULATOR                      │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VOUCHERY (NAVIGATION)                         │
├──────────────────────────────┬──────────────────────────────────┤
│   Moje vouchery              │   Zľavové portály ← NOVÉ!        │
│   (Existujúce)               │   (Partnerské vouchery)           │
└──────────────────────────────┴──────────────────────────────────┘
```

## 🔄 Workflow - Tok Dát

### 1. Vytvorenie Jazdy s Partnerským Voucherom

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│   ZÁKAZNÍK   │────▶│    JAZDY     │────▶│  RIDE SESSION    │
│  (Príde s    │     │  (Formulár)  │     │  (Databáza)      │
│   voucherom) │     └──────────────┘     └──────────────────┘
└──────────────┘            │                      │
                            │                      │
                            ▼                      ▼
                   ┌─────────────────┐    ┌──────────────────┐
                   │  Vyplní údaje:  │    │ PARTNER VOUCHER  │
                   │  • Zdroj: VP    │───▶│   AUTO-CREATE    │
                   │  • Partner      │    │   (Databáza)     │
                   │  • Kód          │    └──────────────────┘
                   └─────────────────┘             │
                                                   │
                                                   ▼
                                          ┌──────────────────┐
                                          │  Status:         │
                                          │  UNCLAIMED 🔸    │
                                          └──────────────────┘
```

### 2. Správa Voucherov v Zľavových Portáloch

```
┌────────────────────────────────────────────────────────────────┐
│              ZĽAVOVÉ PORTÁLY (Dashboard)                        │
├────────────────────────────────────────────────────────────────┤
│  📊 ŠTATISTIKY:                                                │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │  Celkom: 45  │ Neuplatnené:│  Uplatnené:  │              │
│  │   voucherov  │     12 🔸   │     33 ✅    │              │
│  └──────────────┴──────────────┴──────────────┘              │
│                                                                 │
│  🔍 FILTRE:                                                    │
│  ┌──────────────────┬─────────────────────┐                  │
│  │ Stav: [Všetky ▼] │ Partner: [Všetci ▼] │                  │
│  └──────────────────┴─────────────────────┘                  │
│                                                                 │
│  📋 TABUĽKA VOUCHEROV:                                         │
│  ┌─────────┬─────────┬──────────┬─────────┬────────┬────────┐│
│  │ Kód     │ Partner │ Zákazník │ Dátum   │ Stav   │ Akcie  ││
│  ├─────────┼─────────┼──────────┼─────────┼────────┼────────┤│
│  │ ZLV-001 │ Zľavo.  │ Martin N.│ 15.1.   │ 🔸 Neu │ [Upl.] ││
│  │ ADR-123 │ Adrop   │ Jana K.  │ 14.1.   │ ✅ Upl │ [Vráť] ││
│  │ NAJ-456 │ Najzá.  │ Peter S. │ 13.1.   │ 🔸 Neu │ [Upl.] ││
│  └─────────┴─────────┴──────────┴─────────┴────────┴────────┘│
└────────────────────────────────────────────────────────────────┘
```

### 3. Uplatnenie Voucheru

```
┌────────────────┐
│  ADMIN KLIKNE  │
│  "Označiť ako  │
│   uplatnený"   │
└───────┬────────┘
        │
        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  CONFIRMATION   │────▶│  API PATCH       │────▶│  DATABASE   │
│  DIALOG         │     │  /partner-       │     │  UPDATE     │
│  (Potvrdenie)   │     │  vouchers?id=... │     └─────────────┘
└─────────────────┘     └──────────────────┘            │
                                                         ▼
                                                ┌─────────────────┐
                                                │ Status: CLAIMED │
                                                │ claimedAt: NOW  │
                                                └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │   AUDIT LOG     │
                                                │  (História)     │
                                                └─────────────────┘
```

## 🗂️ Databázová Štruktúra

### PartnerVoucher Model

```
┌──────────────────────────────────────────────────────────┐
│                    PARTNER VOUCHER                        │
├──────────────────────────────────────────────────────────┤
│  id:            String (UUID)                             │
│  code:          String (Kód voucheru)                     │
│  partner:       VoucherPartner (ZLAVOMAT/ADROP/...)      │
│  status:        PartnerVoucherStatus (UNCLAIMED/CLAIMED) │
├──────────────────────────────────────────────────────────┤
│  sessionId:     String (FK → RideSession) [UNIQUE]       │
│  customerId:    String                                    │
│  customerName:  String (Cache)                            │
│  customerEmail: String (Cache)                            │
├──────────────────────────────────────────────────────────┤
│  rideDate:      DateTime (Kedy zákazník jazdil)          │
│  claimedAt:     DateTime? (Kedy označené ako uplatnené)  │
│  createdAt:     DateTime                                  │
│  updatedAt:     DateTime                                  │
└──────────────────────────────────────────────────────────┘
             │
             │ 1:1 Relation
             ▼
┌──────────────────────────────────────────────────────────┐
│                     RIDE SESSION                          │
├──────────────────────────────────────────────────────────┤
│  id:            String                                    │
│  source:        RideSessionSource (VOUCHER_PARTNER)      │
│  partner:       VoucherPartner?                           │
│  voucherCode:   String?                                   │
│  ...            (Ostatné polia)                           │
└──────────────────────────────────────────────────────────┘
```

## 📋 Enum Typy

### VoucherPartner
```
┌─────────────────┐
│  ZLAVOMAT       │ → Zobrazí sa ako "Zľavomat"
├─────────────────┤
│  ADROP          │ → Zobrazí sa ako "Adrop"
├─────────────────┤
│  NAJZAZITKY     │ → Zobrazí sa ako "Najzážitky"
└─────────────────┘
```

### PartnerVoucherStatus
```
┌─────────────────────────────────────────┐
│  UNCLAIMED  🔸                          │
│  • Farba: Oranžová                      │
│  • Text: "Neuplatnený"                  │
│  • Význam: Čaká na uplatnenie           │
├─────────────────────────────────────────┤
│  CLAIMED  ✅                            │
│  • Farba: Zelená                        │
│  • Text: "Uplatnený"                    │
│  • Význam: Platba dostnutá              │
└─────────────────────────────────────────┘
```

## 🔌 API Endpointy

### GET /api/partner-vouchers
```
Request:
  GET /api/partner-vouchers

Response:
  [
    {
      id: "abc123",
      code: "ZLV-2024-001",
      partner: "ZLAVOMAT",
      status: "UNCLAIMED",
      customerId: "xyz789",
      customerName: "Martin Novák",
      customerEmail: "martin@example.com",
      rideDate: "2024-01-15T14:30:00Z",
      claimedAt: null,
      session: {
        customer: { ... }
      }
    },
    ...
  ]
```

### PATCH /api/partner-vouchers?id={id}
```
Request:
  PATCH /api/partner-vouchers?id=abc123
  {
    "status": "CLAIMED"
  }

Response:
  {
    id: "abc123",
    ...
    status: "CLAIMED",
    claimedAt: "2024-01-20T10:15:00Z"
  }
```

## 🎨 UI Komponenty

### Štatistické Karty
```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│  Celkom voucherov   │  │    Neuplatnené      │  │     Uplatnené       │
│                     │  │                     │  │                     │
│        45           │  │         12          │  │         33          │
│                     │  │    (oranžová)       │  │     (zelená)        │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

### Status Badge
```
Neuplatnený:  ┌────────────────────┐
              │ 🔸 Neuplatnený    │  (bg-orange-100, text-orange-800)
              └────────────────────┘

Uplatnený:    ┌────────────────────┐
              │ ✅ Uplatnený      │  (bg-green-100, text-green-800)
              └────────────────────┘
```

### Partner Badge
```
┌────────────┐  ┌────────────┐  ┌──────────────┐
│ Zľavomat   │  │   Adrop    │  │  Najzážitky  │
└────────────┘  └────────────┘  └──────────────┘
(bg-blue-100, text-blue-800)
```

## 📊 Prípady Použitia

### Prípad 1: Mesačné vyúčtovanie so Zľavomatom
```
1. Koniec mesiaca → Filter: Partner="Zľavomat", Stav="Neuplatnené"
   ↓
2. Export zoznamu kódov (napr. 15 voucherov)
   ↓
3. Poslať zoznam Zľavomatu
   ↓
4. Dostať faktúru a platbu
   ↓
5. Označiť všetky ako "Uplatnené" (15x klik)
   ↓
6. Hotovo! História uložená v audit logu
```

### Prípad 2: Kontrola chýbajúcich platieb
```
1. Dashboard → Pozrieť "Neuplatnené" štatistiku
   ↓
2. Ak je číslo vysoké → Skontrolovať staršie vouchery
   ↓
3. Filter: Stav="Neuplatnené", zoradiť podľa dátumu
   ↓
4. Nájsť vouchery staršie ako 30 dní
   ↓
5. Kontaktovať partnera ohľadom platby
```

## 🔐 Audit Trail

Systém zaznamenáva:
```
┌────────────────────────────────────────────────────────┐
│  AUDIT LOG ENTRIES                                      │
├────────────────────────────────────────────────────────┤
│  1. CREATE PARTNER_VOUCHER                              │
│     • Kedy: Pri vytvorení jazdy                         │
│     • Čo: Nový partnerský voucher                       │
│     • Detail: Kód, Partner, Zákazník                    │
├────────────────────────────────────────────────────────┤
│  2. UPDATE PARTNER_VOUCHER → CLAIMED                    │
│     • Kedy: Pri označení ako uplatnený                  │
│     • Čo: Zmena stavu                                   │
│     • Detail: Nový stav, Dátum uplatnenia               │
├────────────────────────────────────────────────────────┤
│  3. UPDATE PARTNER_VOUCHER → UNCLAIMED                  │
│     • Kedy: Pri vrátení na neuplatnený                  │
│     • Čo: Zmena stavu                                   │
│     • Detail: Nový stav, Dôvod                          │
└────────────────────────────────────────────────────────┘
```

## 🚀 Výhody Vizuálne

```
PRED:  ❌ Žiadne sledovanie partnerských voucherov
       ❌ Manuálne záznamy v Exceli
       ❌ Ťažko zistiť čo je uplatnené
       ❌ Žiadna história

PO:    ✅ Centrálny systém pre všetky portály
       ✅ Automatické vytváranie pri jazde
       ✅ Jasný vizuálny stav (farby)
       ✅ Kompletná história a audit trail
       ✅ Štatistiky na jeden pohľad
       ✅ Filtrovanie a vyhľadávanie
```

## 📈 Metriky

```
┌─────────────────────────────────────────────────────┐
│  Počet kliknutí potrebných:                         │
├─────────────────────────────────────────────────────┤
│  Vytvorenie partnerského voucheru:      0           │
│  (automatické pri vytvorení jazdy)                  │
├─────────────────────────────────────────────────────┤
│  Označenie ako uplatnený:               1 klik      │
│  (tlačidlo + potvrdenie)                            │
├─────────────────────────────────────────────────────┤
│  Filtrovanie podľa partnera:            2 kliky     │
│  (dropdown + výber)                                 │
└─────────────────────────────────────────────────────┘
```

## 🎯 Zhrnutie

```
┌───────────────────────────────────────────────────────────┐
│  ZĽAVOVÉ PORTÁLY = Centrálna správa partnerských          │
│                    voucherov s automatizáciou             │
└───────────────────────────────────────────────────────────┘
```

✅ **Automatizácia** - Vouchery sa pridávajú sami
✅ **Prehľadnosť** - Všetko na jednom mieste
✅ **Kontrola** - Viete čo je uplatnené a čo nie
✅ **História** - Audit log všetkého
✅ **Štatistiky** - Okamžité čísla
✅ **Filtrovanie** - Rýchle vyhľadávanie

**Výsledok: Úspora času a lepšia kontrola nad platbami od partnerov!** 🎉
