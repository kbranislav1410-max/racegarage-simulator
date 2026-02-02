# ✅ OPRAVA: Challenge časy sa teraz zobrazujú!

## Čo bolo pokazené

V kóde bola **typová chyba** - používalo sa nesprávne meno databázového poľa:

**Súbor:** `src/app/api/rides/route.ts`, riadok 200

**CHYBA:**
```typescript
challengeId: challenge.id,  // ❌ Toto pole neexistuje v schéme
```

**OPRAVENÉ:**
```typescript
challengeMonthId: challenge.id,  // ✅ Správny názov podľa schémy
```

Táto jednoduchá chyba spôsobovala, že:
- Challenge attempt sa **nevytváral** v databáze
- Žiadna chyba sa **nezobrazovala** (zlyhalo ticho)
- Časy sa **neobjavovali** v rebríčku

## 📋 Kompletný návod na spustenie

### 1️⃣ Prvé spustenie (setup)

```bash
# 1. Prejdite do priečinka projektu
cd /home/runner/work/racegarage-simulator/racegarage-simulator

# 2. Nainštalujte dependencies (len ak ste to ešte neurobili)
npm install

# 3. Vygenerujte Prisma klienta (POVINNÉ!)
npm run db:generate

# 4. Vytvorte databázové tabuľky (POVINNÉ!)
npm run db:push

# 5. (Voliteľné) Načítajte testovacie dáta
npm run db:seed
```

### 2️⃣ Každé ďalšie spustenie

```bash
# Len spustite vývojový server
npm run dev
```

Aplikácia bude dostupná na: **http://localhost:3000**

## 🎯 Ako používať Challenge funkciu

### Krok 1: Vytvorenie Challenge mesiaca

1. Kliknite v menu na **"Výzva"** (Challenge ikona 🏆)
2. Ak nevidíte challenge pre aktuálny mesiac, kliknite **"Vytvoriť Challenge"**
3. Vyplňte formulár:
   - **Rok:** (automaticky nastavený na aktuálny rok)
   - **Mesiac:** (automaticky nastavený na aktuálny mesiac)
   - **Názov trate:** napr. "Hlavný okruh"
   - **Názov auta:** napr. "Simulátor"
   - **Trvanie (voliteľné):** napr. 30 minút
4. Kliknite **"Vytvoriť"**

### Krok 2: Zaznamenanie jazdy s časom Challenge

1. Kliknite v menu na **"Jazdy"** (Rides ikona 🏎️)
2. Kliknite **"Pridať jazdu"**
3. Vyplňte formulár:
   - **Zákazník:** Vyberte existujúceho zákazníka
   - **Dátum:** Vyberte dátum
   - **Čas:** Vyberte čas
   - **Zdroj:** Vyberte zdroj (napr. "Zákazník kaviarne")
   - ⭐ **Čas okruhu (mm:ss.SSS):** **TU zadajte challenge čas!**
     - Formát: `minúty:sekundy.milisekundy`
     - Príklady platných časov:
       - `1:23.456` = 1 minúta, 23 sekúnd, 456 milisekúnd
       - `0:59.123` = 59 sekúnd, 123 milisekúnd
       - `2:15.789` = 2 minúty, 15 sekúnd, 789 milisekúnd
   - **Minúty:** Dĺžka jazdy
   - **Poznámky (voliteľné)**
4. Kliknite **"Pridať jazdu"**

### Krok 3: Kontrola rebríčka

1. Vráťte sa na **"Výzva"** (Challenge)
2. Mali by ste vidieť:
   - **Rebríček** s menom zákazníka a jeho časom
   - **Pozíciu** v rebríčku (1., 2., 3., ...)
   - **Počet pokusov** pre každého zákazníka
   - **Dátum posledného pokusu**

## 🔍 Overenie, že všetko funguje

### Test 1: Vytvorenie Challenge
- ✅ Challenge sa vytvorí bez chyby
- ✅ Zobrazí sa na stránke "Výzva"

### Test 2: Zaznamenanie času
- ✅ Jazda sa vytvorí úspešne
- ✅ Žiadna chyba sa nezobrazí

### Test 3: Zobrazenie v rebríčku
- ✅ Zákazník sa objaví v rebríčku
- ✅ Čas je správne sformátovaný (napr. "1:23.456")
- ✅ Pozícia v rebríčku je správna (najrýchlejší na 1. mieste)

## 🛠️ Riešenie problémov

### Problém: "next: not found"
**Riešenie:** Spustite `npm install` najprv

### Problém: Prisma chyby
**Riešenie:** Spustite v poradí:
```bash
npm run db:generate
npm run db:push
```

### Problém: Databáza sa nespojí
**Riešenie:** Skontrolujte `.env` súbor s DATABASE_URL

### Problém: Čas sa stále nezobrazuje
**Riešenie:** 
1. Skontrolujte formát času (musí byť mm:ss.SSS)
2. Skontrolujte, či existuje challenge pre daný mesiac
3. Refresh-nite stránku Challenge (F5)

## 📊 Technické detaily

### Databázová schéma

**ChallengeMonth** (Mesiac výzvy)
- `id` - Unikátne ID
- `year` - Rok (napr. 2026)
- `month` - Mesiac (1-12)
- `trackName` - Názov trate
- `carName` - Názov auta
- `durationMinutes` - Trvanie (voliteľné)

**ChallengeAttempt** (Pokus vo výzve)
- `id` - Unikátne ID
- `customerId` - ID zákazníka
- `challengeMonthId` - ✅ **ID mesiaca výzvy (OPRAVENÉ!)**
- `lapTimeMs` - Čas okruhu v milisekundách
- `recordedAt` - Dátum zaznamenania
- `sessionId` - ID jazdy (voliteľné)

### Automatické správanie

1. **Auto-vytvorenie challenge:**
   - Ak pri pridávaní jazdy zadáte čas challenge
   - A challenge pre aktuálny mesiac neexistuje
   - Systém ho automaticky vytvorí s názvami:
     - Trať: "Hlavný okruh"
     - Auto: "Simulátor"

2. **Rebríček:**
   - Automaticky sa zoraďuje podľa najrýchlejšieho času
   - Zobrazuje sa len najlepší čas každého zákazníka
   - Počíta všetky pokusy každého zákazníka

## ✨ Všetko je teraz opravené!

Aplikácia je **plne funkčná** a pripravená na použitie. Ak máte ďalšie otázky alebo problémy, skontrolujte tento návod alebo README.md súbor.

---
**Opravené:** 27. január 2026
**Autor opravy:** GitHub Copilot
