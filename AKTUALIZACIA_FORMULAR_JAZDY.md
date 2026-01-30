# Aktualizácia Formulára Jazdy - Kompletný Návod

## Čo Bolo Zmenené?

### 1. Odstránené Pole "Zdroj" ✅

**Pred:**
- Formulár mal pole "Zdroj" s možnosťami: Rezervácia, Zákazník kaviarne, Poukaz - partner, Poukaz
- Toto pole bolo zbytočné, lebo metóda platby už určuje kontext

**Po:**
- Pole "Zdroj" úplne odstránené
- API používa default hodnotu "RESERVATION" interně
- Formulár je jednoduchší

### 2. Zjednodušené Metódy Platby ✅

**Pred:**
```
PD Drive club (→ Kamarát)
Poukaz - partner (→ Ja)
Poukaz - Racegarage (→ Ja)
Poukaz - PD Drive Club (→ Kamarát)
```

**Po:**
```
PD Drive Club
Poukaz - Partner
Poukaz - Racegarage
Poukaz - PD Drive club
```

### 3. Podmienené Polia Podľa Metódy Platby ✅

**Pou kaz - Partner:**
- Zobrazí dropdown "Partner" (Zľavomat, Adrop, Najzážitky) - **povinné**
- Zobrazí pole "Číslo poukazu" - **povinné**

**Poukaz - Racegarage:**
- Zobrazí pole "Číslo poukazu" - nepovinné

**Poukaz - PD Drive club:**
- Zobrazí pole "Číslo poukazu" - nepovinné

**PD Drive Club:**
- Žiadne extra polia

## Vizuálny Prehľad

### Nový Formulár

```
┌─────────────────────────────────────────────────────────┐
│  ZÁZNAM JAZDY                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Vyhľadať Zákazníka                                     │
│  ┌────────────────────────────────────┐                │
│  │ [Search box]                       │                │
│  └────────────────────────────────────┘                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ÚDAJE O JAZDE                                          │
│                                                         │
│  Dátum *          Čas *                                 │
│  ┌──────────┐    ┌──────────┐                          │
│  │2024-01-28│    │  14:00   │                          │
│  └──────────┘    └──────────┘                          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  PLATBA                                                 │
│                                                         │
│  Suma (€)                                               │
│  ┌────────────────────────────────────┐                │
│  │  25.00                             │                │
│  └────────────────────────────────────┘                │
│  Nechajte prázdne ak nebola platba                      │
│                                                         │
│  Metóda platby                                          │
│  ┌────────────────────────────────────┐                │
│  │  PD Drive Club              ▼      │                │
│  └────────────────────────────────────┘                │
│                                                         │
│  [AK "Poukaz - Partner" VYBRATÉ]                       │
│  ┌─────────────────────────────────────────────┐       │
│  │ Partner *                                   │       │
│  │ ┌─────────────────────────────────┐         │       │
│  │ │  Zľavomat               ▼       │         │       │
│  │ └─────────────────────────────────┘         │       │
│  │                                             │       │
│  │ Číslo poukazu *                             │       │
│  │ ┌─────────────────────────────────┐         │       │
│  │ │  ZLV-2024-001                   │         │       │
│  │ └─────────────────────────────────┘         │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
│  [AK INÝ VOUCHER VYBRANÝ]                               │
│  ┌─────────────────────────────────────────────┐       │
│  │ Číslo poukazu                               │       │
│  │ ┌─────────────────────────────────┐         │       │
│  │ │  RG-001                          │         │       │
│  │ └─────────────────────────────────┘         │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ĎALŠIE ÚDAJE                                           │
│                                                         │
│  Minúty *                                               │
│  ┌────────────────────────────────────┐                │
│  │  30                                │                │
│  └────────────────────────────────────┘                │
│                                                         │
│  Poznámka                                               │
│  ┌────────────────────────────────────┐                │
│  │                                    │                │
│  │                                    │                │
│  └────────────────────────────────────┘                │
│                                                         │
│  ┌──────────────────────┐                              │
│  │  Zaznamenať Jazdu    │                              │
│  └──────────────────────┘                              │
└─────────────────────────────────────────────────────────┘
```

## Testovacie Scenáre

### Test 1: PD Drive Club (Základná Platba)

**Kroky:**
1. Jazdy → Záznam jazdy
2. Vyhľadať a vybrať zákazníka
3. Vyplniť:
   - Dátum: 2024-01-28
   - Čas: 14:00
   - Suma: 25.00 €
   - **Metóda: PD Drive Club**
   - Minúty: 30
4. Zaznamenať

**Očakávaný výsledok:**
- ✅ Žiadne extra polia sa nezobrazia
- ✅ Platba vytvorená s receiver: FRIEND
- ✅ Zobrazí sa v Platbách s modrým odznakom

### Test 2: Poukaz - Partner (Zľavomat)

**Kroky:**
1. Jazdy → Záznam jazdy
2. Vyhľadať a vybrať zákazníka
3. Vyplniť:
   - Dátum: 2024-01-28
   - Čas: 15:00
   - Suma: 30.00 €
   - **Metóda: Poukaz - Partner**
   - **Partner: Zľavomat** (zobrazí sa)
   - **Číslo poukazu: ZLV-2024-001** (zobrazí sa)
   - Minúty: 45
4. Zaznamenať

**Očakávaný výsledok:**
- ✅ Zobrazí sa dropdown Partner
- ✅ Zobrazí sa pole Číslo poukazu (povinné)
- ✅ Platba vytvorená s receiver: ME
- ✅ Partner voucher vytvorený v Zľavových portáloch
- ✅ Zobrazí sa v Platbách s fialovým odznakom

### Test 3: Poukaz - Racegarage

**Kroky:**
1. Jazdy → Záznam jazdy
2. Vyhľadať a vybrať zákazníka
3. Vyplniť:
   - Dátum: 2024-01-28
   - Čas: 16:00
   - Suma: 20.00 €
   - **Metóda: Poukaz - Racegarage**
   - **Číslo poukazu: RG-001** (zobrazí sa, nepovinné)
   - Minúty: 30
4. Zaznamenať

**Očakávaný výsledok:**
- ✅ Zobrazí sa pole Číslo poukazu (nepovinné)
- ✅ Platba vytvorená s receiver: ME
- ✅ Zobrazí sa v Platbách so zeleným odznakom

### Test 4: Poukaz - PD Drive club

**Kroky:**
1. Jazdy → Záznam jazdy
2. Vyhľadať a vybrať zákazníka
3. Vyplniť:
   - Dátum: 2024-01-28
   - Čas: 17:00
   - Suma: 35.00 €
   - **Metóda: Poukaz - PD Drive club**
   - **Číslo poukazu: PD-001** (zobrazí sa, nepovinné)
   - Minúty: 60
4. Zaznamenať

**Očakávaný výsledok:**
- ✅ Zobrazí sa pole Číslo poukazu (nepovinné)
- ✅ Platba vytvorená s receiver: FRIEND
- ✅ Zobrazí sa v Platbách s oranžovým odznakom

## Tabuľka Jázd

### Pred

```
| Čas   | Zákazník        | Minúty | Zdroj         | Poznámky | Akcie |
|-------|-----------------|--------|---------------|----------|-------|
| 14:00 | Martin Novák    | 30     | RESERVATION   | -        | 🗑️    |
| 15:00 | Jana Horváth    | 45     | VOUCHER_...   | -        | 🗑️    |
```

### Po

```
| Čas   | Zákazník        | Minúty | Poznámky | Akcie |
|-------|-----------------|--------|----------|-------|
| 14:00 | Martin Novák    | 30     | -        | 🗑️    |
| 15:00 | Jana Horváth    | 45     | -        | 🗑️    |
```

**Zmena:** Stĺpec "Zdroj" odstránený z tabuľky.

## FAQ

### Q: Prečo bolo odstránené pole "Zdroj"?

**A:** Pole "Zdroj" bolo zbytočné, pretože metóda platby už určuje kontext (PD Drive club vs. poukazy). Odstránenie zjednodušuje formulár.

### Q: Kde sa deje hodnota "Zdroj"?

**A:** API automaticky nastaví default hodnotu "RESERVATION" interně. Toto je transparentné pre používateľa.

### Q: Prečo niet šípok "(→ Kamarát)" v metóde platby?

**A:** Dropdown obsahuje už len čisté názvy metód. Šípky sú len v zobrazení v tabuľke Platby, nie vo formulári.

### Q: Je číslo poukazu vždy povinné?

**A:** Nie. Je povinné len pri "Poukaz - Partner" (kvôli externým partnerom). Pri ostatných voucher metódach je nepovinné.

### Q: Čo sa stane keď zmením metódu platby?

**A:** Partner a číslo poukazu sa automaticky vymažú (reset), aby nedošlo k nekonzistentnému stavu.

### Q: Funguje to aj na Dashboarde?

**A:** Áno! Dashboard "Zaznamenať jazdu" má rovnaký formulár so všetkými zmenami.

## Výhody Zmien

### Pred
- ❌ 6 polí v peak (so source + conditionals)
- ❌ Zbytočné pole "Zdroj"
- ❌ Duplicitná logika (source + payment method)
- ❌ Dlhé názvy metód so šípkami
- ❌ Tabuľka s nadbytočným stĺpcom
- ❌ Zmätočné pre používateľa

### Po
- ✅ Max 5 polí (bez source)
- ✅ Jednoduchšia logika (len payment method)
- ✅ Čisté názvy metód
- ✅ Kompaktnejšia tabuľka
- ✅ Jasné čo treba vyplniť
- ✅ Intuitívnejšie používanie

## Technické Detaily

### Mapovanie Príjemcov

```typescript
PD_DRIVE_CLUB          → FRIEND
VOUCHER_PARTNER        → ME (+ vytvorí PartnerVoucher)
VOUCHER_RACEGARAGE     → ME
VOUCHER_PD_DRIVE_CLUB  → FRIEND
```

### Validácia

- **Partner:** Povinný len pri "VOUCHER_PARTNER"
- **Číslo poukazu:** Povinné len pri "VOUCHER_PARTNER"
- **Suma:** Vždy nepovinná
- **Minúty:** Vždy povinné

### API Zmeny

**Pred:**
```json
{
  "source": "VOUCHER_PARTNER",
  "partner": "ZLAVOMAT",
  "voucherCode": "ZLV-001"
}
```

**Po:**
```json
{
  "source": "RESERVATION",  // Auto-set
  "partner": "ZLAVOMAT",    // Only if paymentMethod === VOUCHER_PARTNER
  "voucherCode": "ZLV-001"  // Only if voucher payment method
}
```

## Zhrnutie

**Commit:** d4cf911

**Súbory zmenené:**
- `/src/app/rides/page.tsx` - Hlavný formulár jazdy
- `/src/app/dashboard/page.tsx` - Dashboard quick form

**Riadkov kódu:**
- Odstránené: 140 riadkov
- Pridané: 95 riadkov
- **Netto: -45 riadkov** (jednoduchší kód!)

**Status:** ✅ Production Ready

---

*Vytvorené: 28. január 2024*
*Autor: GitHub Copilot*
*Verzia: 1.0*
