# Zľavové Portály - Správa Partnerských Voucherov

## Čo je to?

Nová funkcia **"Zľavové portály"** vám umožňuje sledovať a spravovať voucher kódy, ktoré zákazníci kúpili cez partnerské portály ako Zľavomat, Adrop, alebo Najzážitky.

## Ako to funguje?

### 1. Zákazník používa partnerský voucher

Keď zákazník príde s voucherom zakúpeným na Zľavomate alebo inom portáli:

1. Vytvoríte záznam z jazdy v sekcii **"Jazdy"**
2. Pri vytváraní jazdy vyberiete:
   - **Zdroj:** "Voucher partner"
   - **Partner:** Vyberiete portál (Zľavomat / Adrop / Najzážitky)
   - **Kód voucheru:** Zadáte kód z voucheru
3. Po vytvorení jazdy sa tento voucher **automaticky** objaví v sekcii **"Vouchery → Zľavové portály"**
4. Stav voucheru bude **"Neuplatnený"** (oranžový štítok)

### 2. Uplatnenie voucheru u partnera

Po tom, čo si voucher uplatníte u partnera a dostanete od nich platbu:

1. Choďte do **"Vouchery → Zľavové portály"**
2. Nájdite voucher v zozname
3. Kliknite na **"Označiť ako uplatnený"**
4. Potvrdíte akciu
5. Systém automaticky:
   - Zmení stav na **"Uplatnený"** (zelený štítok)
   - Zaznamená dátum a čas uplatnenia
   - Vytvorí audit log pre sledovanie

## Kde to nájdem?

### Navigácia
1. V hlavnom menu kliknite na **"Vouchery"**
2. Uvidíte dve záložky:
   - **"Moje vouchery"** - Vaše vlastné vouchery (ktoré ste vytvorili)
   - **"Zľavové portály"** - Voucher kódy od partnerov

### Sekcia Zľavové portály

Na tejto stránke uvidíte:

#### Štatistiky (hore)
- **Celkom voucherov** - Počet všetkých partnerských voucherov
- **Neuplatnené** - Počet voucherov, ktoré ste ešte neuplatnili u partnera
- **Uplatnené** - Počet voucherov, za ktoré ste už dostali platbu

#### Filtre
- **Stav:** Všetky / Neuplatnené / Uplatnené
- **Partner:** Všetci partneri / Zľavomat / Adrop / Najzážitky

#### Tabuľka s voucherami

Každý riadok zobrazuje:
- **Kód voucheru** - Kód, ktorý zadal zákazník
- **Partner** - Z ktorého portálu pochádza (modrý štítok)
- **Zákazník** - Meno a email zákazníka, ktorý ho použil
- **Dátum jazdy** - Kedy zákazník jazdil
- **Stav:**
  - 🔸 **Neuplatnený** (oranžový) - Ešte ste nedostali platbu
  - ✅ **Uplatnený** (zelený) - Už ste dostali platbu
- **Uplatnené dňa** - Kedy ste označili ako uplatnený (dátum a čas)
- **Akcie** - Tlačidlo na zmenu stavu

## Príklad použitia

### Scenár 1: Nový zákazník s Zľavomatom

1. **Zákazník príde s voucherom zo Zľavomatu**
   - Kód voucher: `ZLV-2024-XXXX`
   - Chce jazdiť 30 minút

2. **Vytvoríte jazdu:**
   - Jazdy → Pridať jazdu
   - Vyberiete zákazníka
   - Zdroj: "Voucher partner"
   - Partner: "Zľavomat"
   - Kód voucheru: `ZLV-2024-XXXX`
   - Minúty: 30
   - Pridáte jazdu

3. **Skontrolujete Zľavové portály:**
   - Vouchery → Zľavové portály
   - Uvidíte nový voucher so stavom "Neuplatnený"
   - Vidíte že zákazník Martin Novák jazdil dnes o 14:30

4. **Na konci mesiaca si uplatníte vouchery:**
   - Pošlete zoznam kódov partnerovi (Zľavomat)
   - Partner vám pošle platbu
   - V systéme označíte všetky vouchery ako "Uplatnené"
   - Systém zaznamená dátum uplatnenia

### Scenár 2: Kontrola neuplatnených voucherov

Na konci mesiaca chcete vedieť, koľko peňazí vám partneri dlhujú:

1. **Filtrovanie:**
   - Vouchery → Zľavové portály
   - Stav: "Neuplatnené"
   - Partner: "Zľavomat"

2. **Uvidíte:**
   - 15 neuplatnených voucherov zo Zľavomatu
   - Zoznam všetkých kódov a zákazníkov
   - Kedy boli použité

3. **Akcia:**
   - Skopírujete kódy
   - Pošlete ich Zľavomatu na uplatnenie
   - Po dostanú platby ich označíte ako uplatnené

## Prehľad stavov

### 🔸 Neuplatnený (UNCLAIMED)
- **Čo to znamená:** Zákazník použil voucher, ale vy ste ešte nedostali platbu od partnera
- **Farba:** Oranžová
- **Akcia:** Musíte si uplatniť voucher u partnera
- **Ako zmeniť:** Kliknite "Označiť ako uplatnený" po dostani platby

### ✅ Uplatnený (CLAIMED)
- **Čo to znamená:** Už ste dostali platbu od partnera za tento voucher
- **Farba:** Zelená
- **Dátum uplatnenia:** Zobrazuje sa, kedy ste ho označili ako uplatnený
- **Ako zmeniť:** Ak ste sa pomýlili, môžete kliknúť "Označiť ako neuplatnený"

## Často kladené otázky (FAQ)

### Q: Prečo sa mi voucher nezobrazuje v Zľavových portáloch?

**A:** Voucher sa zobrazí len ak:
1. Pri vytváraní jazdy ste vybrali **Zdroj: "Voucher partner"**
2. Vybrali ste **partnera** (Zľavomat / Adrop / Najzážitky)
3. Zadali ste **kód voucheru**

Všetky tri podmienky musia byť splnené!

### Q: Môžem vymazať voucher zo Zľavových portálov?

**A:** Nie, vouchery nie je možné vymazať, pretože sú spojené s jazdou. Ak potrebujete opraviť chybu, môžete:
- Zmeniť stav medzi "Neuplatnený" a "Uplatnený"
- Alebo vymazať celú jazdu (čím sa voucher tiež vymaže)

### Q: Čo ak si chcem pozrieť všetky vouchery od Zľavomatu?

**A:** Použite filter:
1. Vouchery → Zľavové portály
2. Partner: "Zľavomat"
3. Stav: môžete ponechať "Všetky" alebo vybrať konkrétny stav

### Q: Ako viem, koľko peňazí mi partneri dlhujú?

**A:** 
1. Pozrite sa na štatistiku **"Neuplatnené"** hore na stránke
2. Alebo nastavte filter na "Neuplatnené" a spočítajte hodnoty voucherov

### Q: Čo ak omylom označím voucher ako uplatnený?

**A:** Žiadny problém! Môžete kliknúť na "Označiť ako neuplatnený" a vrátiť ho späť.

### Q: Ukladá sa história zmien?

**A:** Áno! Každá zmena stavu sa zaznamenáva do audit logu. Môžete vidieť:
- Kedy bol voucher vytvorený
- Kedy bol označený ako uplatnený
- Kto vykonal zmenu

## Technické detaily

### Databázové polia

Každý partnerský voucher obsahuje:
- **id** - Jedinečný identifikátor
- **code** - Kód voucheru
- **partner** - Partner (ZLAVOMAT, ADROP, NAJZAZITKY)
- **status** - Stav (UNCLAIMED, CLAIMED)
- **sessionId** - Prepojenie na jazdu
- **customerId** - ID zákazníka
- **customerName** - Meno zákazníka (cache)
- **customerEmail** - Email zákazníka (cache)
- **rideDate** - Dátum jazdy
- **claimedAt** - Dátum uplatnenia (null ak nie je uplatnený)
- **createdAt** - Dátum vytvorenia záznamu
- **updatedAt** - Dátum poslednej úpravy

### API Endpointy

- `GET /api/partner-vouchers` - Načíta všetky partnerské vouchery
- `PATCH /api/partner-vouchers?id={id}` - Aktualizuje stav voucheru

### Audit log

Systém zaznamenáva:
- Vytvorenie partnerského voucheru pri jazde
- Zmenu stavu na CLAIMED
- Zmenu stavu na UNCLAIMED

## Výhody tejto funkcie

✅ **Prehľadnosť** - Vidíte všetky partnerské vouchery na jednom mieste

✅ **Sledovanie platieb** - Viete, koľko peňazí vám partneri dlhujú

✅ **História** - Vidíte kedy bol voucher použitý a kedy uplatnený

✅ **Filtrovanie** - Rýchlo nájdete neuplatnené vouchery pre konkrétneho partnera

✅ **Automatizácia** - Vouchery sa pridávajú automaticky pri vytvorení jazdy

✅ **Audit trail** - Kompletná história všetkých zmien

## Zhrnutie

Funkcia **Zľavové portály** vám pomáha:
1. 📝 **Sledovať** všetky voucher kódy od partnerov
2. 💰 **Kontrolovať** ktoré vouchery ste už uplatnili
3. 📊 **Vidieť štatistiky** neuplatnených a uplatnených voucherov
4. 🔍 **Filtrovať** podľa partnera a stavu
5. ✅ **Označovať** vouchery ako uplatnené po dostani platby
6. 📅 **Zaznamenávať** kedy ste dostali platbu od partnera

Teraz máte kompletnú kontrolu nad všetkými voucher kódmi od partnerských portálov!
