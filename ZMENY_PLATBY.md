# Zmeny v Zdrojoch a Metódach Platby

## Prehľad Zmien

Aktualizovali sme zdroje jázd a metódy platby, aby lepšie odrážali realitu vášho podnikania a správne sledovali, kto dostáva platby.

---

## Zdroje Jázd (Source)

### Aktuálne Možnosti

Pri vytváraní záznamu jazdy máte 4 možnosti zdroja:

1. **Rezervácia** - Jazda z online rezervácie
2. **Zákazník kaviarne** - Walk-in zákazník z kaviarne
3. **Poukaz - partner** - Zákazník s voucherom od partnera (Zľavomat, Adrop, Najzážitky)
4. **Poukaz** - Zákazník s vašim vlastným voucherom

### Zmeny
- **Pred:** "Voucher partner" a "Voucher"
- **Po:** "Poukaz - partner" a "Poukaz" (lepší slovenský preklad)

---

## Metódy Platby (Payment Method)

### Nové Možnosti

Pri vytváraní záznamu jazdy s platbou máte 4 metódy platby:

#### 1. PD Drive club (→ Kamarát)
- **Kód:** `PD_DRIVE_CLUB`
- **Príjemca:** FRIEND (Kamarát)
- **Použitie:** Keď zákazník platí priamo PD Drive clubu
- **Sledovanie platieb:** Platba ide kamarátovi
- **Príklad:** Hotovostná platba, kartová platba na mieste

#### 2. Poukaz - partner (→ Ja)
- **Kód:** `VOUCHER_PARTNER`
- **Príjemca:** ME (Ja)
- **Použitie:** Voucher zakúpený cez partnera (Zľavomat, Adrop, Najzážitky)
- **Sledovanie platieb:** Platba ide mne (od partnera)
- **Príklad:** Zákazník použil Zľavomat voucher

#### 3. Poukaz - Racegarage (→ Ja)
- **Kód:** `VOUCHER_RACEGARAGE`
- **Príjemca:** ME (Ja)
- **Použitie:** Váš vlastný voucher (vytvorený v systéme)
- **Sledovanie platieb:** Platba ide mne
- **Príklad:** Zákazník použil váš voucher

#### 4. Poukaz - PD Drive Club (→ Kamarát)
- **Kód:** `VOUCHER_PD_DRIVE_CLUB`
- **Príjemca:** FRIEND (Kamarát)
- **Použitie:** Voucher vytvorený PD Drive clubom
- **Sledovanie platieb:** Platba ide kamarátovi
- **Príklad:** Špecifický voucher od PD Drive club

---

## Mapovanie Príjemcov

### Pravidlá

**Platby pre KAMARÁTA (FRIEND):**
- PD Drive club
- Poukaz - PD Drive Club

**Platby pre MŇA (ME):**
- Poukaz - partner
- Poukaz - Racegarage

### Automatizácia

Systém **automaticky nastaví správneho príjemcu** na základe zvolenej metódy platby. Nemusíte to manuálne vyberať.

---

## Ako To Funguje

### Príklad 1: Hotovostná Platba

```
1. Zákazník príde do kaviarne (walk-in)
2. Zdroj: "Zákazník kaviarne"
3. Suma: 25.00 €
4. Metóda platby: "PD Drive club (→ Kamarát)"
→ Platba sa zaznamená s receiver: FRIEND
→ V sledovaní platieb uvidíte, že ide kamarátovi
```

### Príklad 2: Zľavomat Voucher

```
1. Zákazník má voucher zo Zľavomatu
2. Zdroj: "Poukaz - partner"
3. Partner: "Zľavomat"
4. Kód voucheru: "ZLV-2024-001"
5. Suma: 25.00 € (za voucher dostanete od Zľavomatu)
6. Metóda platby: "Poukaz - partner (→ Ja)"
→ Platba sa zaznamená s receiver: ME
→ V sledovaní platieb uvidíte, že ide vám
```

### Príklad 3: Váš Vlastný Voucher

```
1. Zákazník má váš voucher
2. Zdroj: "Poukaz"
3. Kód voucheru: "RACE-2024-050"
4. Suma: 30.00 €
5. Metóda platby: "Poukaz - Racegarage (→ Ja)"
→ Platba sa zaznamená s receiver: ME
→ V sledovaní platieb uvidíte, že ide vám
```

### Príklad 4: PD Drive Club Voucher

```
1. Zákazník má voucher od PD Drive club
2. Zdroj: "Poukaz"
3. Kód voucheru: "PD-2024-100"
4. Suma: 25.00 €
5. Metóda platby: "Poukaz - PD Drive Club (→ Kamarát)"
→ Platba sa zaznamená s receiver: FRIEND
→ V sledovaní platieb uvidíte, že ide kamarátovi
```

---

## Sledovanie Platieb

### Prehľad

V sekcii **Platby** uvidíte všetky platby s príjemcom:

**Platby pre vás (ME):**
- Zelený štítok "→ Ja"
- Poukaz - partner
- Poukaz - Racegarage

**Platby pre kamaráta (FRIEND):**
- Modrý štítok "→ Kamarát"
- PD Drive club
- Poukaz - PD Drive Club

### Vyúčtovanie

**50/50 split:**
- Platby s receiver: FRIEND = 50% pre kamaráta
- Platby s receiver: ME = 100% pre vás

---

## Databázové Zmeny

### Nový PaymentMethod Enum

**Staré hodnoty (odstránené):**
- CASH_ON_SITE
- CARD_ON_SITE
- VOUCHER_PORTAL
- PREPAID

**Nové hodnoty:**
- PD_DRIVE_CLUB
- VOUCHER_PARTNER
- VOUCHER_RACEGARAGE
- VOUCHER_PD_DRIVE_CLUB

### Migrácia

⚠️ **DÔLEŽITÉ:** Po pull zmien spustite:

```bash
npm run db:push
```

Toto aktualizuje databázovú schému s novými hodnotami.

---

## Kde To Nájdem

### Vytvorenie Jazdy

```
1. Prihláste sa do systému
2. Menu → Jazdy
3. Klik "Záznam jazdy"
4. Vyberte zákazníka
5. Vyplňte formulár:
   - Dátum a čas
   - Zdroj (4 možnosti)
   - Partner (ak je zdroj "Poukaz - partner")
   - Kód voucheru (ak je zdroj voucher)
   - Suma (€)
   - Metóda platby (4 možnosti s → Kamarát alebo → Ja)
   - Minúty
   - Poznámka
6. Zaznamenať jazdu
```

### Sledovanie Platieb

```
1. Menu → Platby
2. Uvidíte všetky platby s:
   - Dátum
   - Zákazník
   - Suma
   - Metóda
   - Príjemca (→ Kamarát alebo → Ja)
```

---

## FAQ

### Q: Prečo 4 metódy platby?

A: Každá metóda má špecifického príjemcu a použitie:
- **PD Drive club** - priama platba kamarátovi
- **Poukaz - partner** - platba od partnera vám
- **Poukaz - Racegarage** - platba z vášho voucheru vám
- **Poukaz - PD Drive Club** - platba z PD voucher kamarátovi

### Q: Môžem zmeniť príjemcu manuálne?

A: Nie. Príjemca sa automaticky nastaví podľa metódy platby. To zabezpečuje konzistentnosť.

### Q: Čo ak sa pomýlim v metóde platby?

A: Bude potrebné odstrániť jazdu a vytvoriť novú so správnou metódou.

### Q: Ako viem, ktorú metódu použiť?

A: Pozrite sa na label v zátvorke:
- **(→ Kamarát)** = platba ide kamarátovi
- **(→ Ja)** = platba ide vám

### Q: Funguje to aj pre staré jazdy?

A: Nie. Staré jazdy majú staré metódy platby. Nové zmeny platia len pre nové jazdy.

### Q: Čo sa stalo so starými metódami?

A: Boli nahradené novými. Databázová schéma sa zmenila.

---

## Výhody

### Pred

- ❌ Nejasné metódy platby
- ❌ Ťažko sledovať, kto dostáva platbu
- ❌ Generické názvy

### Po

- ✅ Jasné metódy platby so slovenským názvom
- ✅ Viditeľné, kto dostáva platbu (→ Kamarát / → Ja)
- ✅ Špecifické pre váš business model
- ✅ Automatické nastavenie príjemcu
- ✅ Správne vyúčtovanie v sekcii Platby

---

## Technické Detaily

### Databázová Schéma

```prisma
enum PaymentMethod {
  PD_DRIVE_CLUB          // → FRIEND
  VOUCHER_PARTNER        // → ME
  VOUCHER_RACEGARAGE     // → ME
  VOUCHER_PD_DRIVE_CLUB  // → FRIEND
}

enum PaymentReceiver {
  FRIEND  // Kamarát (50% split)
  ME      // Ja (100%)
}
```

### API Logika

```typescript
// Automatické mapovanie
if (paymentMethod === "PD_DRIVE_CLUB" || 
    paymentMethod === "VOUCHER_PD_DRIVE_CLUB") {
  receiver = "FRIEND";
} else {
  receiver = "ME";
}
```

---

## Zhrnutie

**Zdroje:**
- 4 možnosti: Rezervácia, Zákazník kaviarne, Poukaz - partner, Poukaz

**Metódy platby:**
- 4 možnosti so správnym príjemcom
- 2 → Kamarát (FRIEND)
- 2 → Ja (ME)

**Automatizácia:**
- Príjemca sa nastavuje automaticky
- Správne sledovanie v Platbách
- Správne vyúčtovanie

**Akcia požadovaná:**
```bash
npm run db:push  # Aktualizovať databázu
```

---

*Vytvorené: Január 2024*
*Verzia: 1.0.0*
*Status: ✅ Implementované*
