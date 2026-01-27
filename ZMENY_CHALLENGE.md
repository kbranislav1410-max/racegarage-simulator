# Zmeny v Challenge Funkcionality

## Prehľad zmien

Implementovali sme požadované zmeny v Challenge systéme:

### 1. ✅ Odstránená automatická integrácia lap time z formulára jazdy

**Čo bolo odstránené:**
- Pole "Čas okruhu (mm:ss.SSS)" z formulára na pridanie jazdy
- Automatické vytváranie challenge attempt pri pridaní jazdy s lap time
- Spracovanie lap time v API pri vytváraní jazdy
- Validácia `lapTime` poľa v Zod schéme

**Dôsledok:**
- Challenge časy sa už **NEDAJÚ** pridať automaticky z formulára jazdy
- Challenge časy sa musia pridávať **RUČNE** cez stránku "Výzva" (Challenge)

### 2. ✅ Zmenené zobrazenie Challenge rebríčka

**Predtým:**
- Zobrazoval sa len najrýchlejší čas každého zákazníka
- Bola poznámka o počte pokusov (napr. "3 attempts")
- Jeden zákazník = jeden riadok v rebríčku

**Teraz:**
- Zobrazuje sa **KAŽDÝ** pokus jednotlivo
- Každý pokus má vlastný riadok, aj keď je od toho istého zákazníka
- Ak má zákazník 3 pokusy, zobrazí sa 3x v rebríčku
- Každý riadok obsahuje:
  - **Poradie** (#1, #2, #3...) - podľa najrýchlejšieho času
  - **Zákazník** - meno a email
  - **Čas** - lap time vo formáte mm:ss.SSS
  - **Dátum** - kedy bol pokus zaznamenaný
  - **Akcie** - tlačidlo na vymazanie

### 3. ✅ Pridaná možnosť vymazať pokus

**Nová funkcionalita:**
- Pri každom pokuse v rebríčku je ikona koša (Trash)
- Kliknutím na ikonu sa zobrazí potvrdzovacie okno: "Naozaj chcete odstrániť pokus používateľa [Meno]?"
- Po potvrdení sa pokus odstráni z databázy
- Rebríček sa automaticky aktualizuje
- Vymazanie sa zaznamená do audit logu

## API Zmeny

### Nový endpoint
- `DELETE /api/challenges/attempts?id={attemptId}` - Vymaže špecifický challenge attempt

### Upravený endpoint
- `GET /api/challenges/attempts?challengeMonthId={id}` 
  - **Predtým:** Vracal zoskupené výsledky (najlepší čas per zákazník)
  - **Teraz:** Vracia všetky pokusy jednotlivo, zoradené od najrýchlejšieho

## Ako používať Challenge teraz

### Krok 1: Vytvorte Challenge mesiac
1. Choďte na "Výzva" (Challenge) v menu
2. Vyberte rok a mesiac
3. Ak challenge neexistuje, kliknite "Vytvoriť Challenge"
4. Vyplňte údaje (Názov trate, Názov auta, Trvanie)

### Krok 2: Pridajte časy ručne
1. Na stránke Challenge kliknite "Pridať pokus"
2. Vyhľadajte a vyberte zákazníka
3. Zadajte čas okruhu (formát: mm:ss.SSS, napr. "1:23.456")
4. Voliteľne: Zadajte ID jazdy (sessionId) ak ide o konkrétnu jazdu

### Krok 3: Zobrazenie rebríčka
- Všetky pokusy sa zobrazia v tabuľke
- Zoradené od najrýchlejšieho času
- Top 3 majú ikony trofejí (🥇🥈🥉)

### Krok 4: Vymazanie pokusu
1. Kliknite na ikonu koša pri pokuse
2. Potvrďte vymazanie
3. Pokus sa odstráni z rebríčka

## Príklad použitia

**Scenár:** Zákazník Martin Novák má 3 pokusy

**Ako to vyzerá v rebríčku:**

| Poradie | Zákazník | Čas | Dátum | Akcie |
|---------|----------|-----|-------|-------|
| 🥇 #1 | Martin Novák<br>martin@example.com | 1:23.456 | 15.1.2026 | 🗑️ |
| #5 | Martin Novák<br>martin@example.com | 1:28.789 | 14.1.2026 | 🗑️ |
| #12 | Martin Novák<br>martin@example.com | 1:35.123 | 13.1.2026 | 🗑️ |

**Vysvetlenie:**
- Martin má 3 samostatné riadky v rebríčku
- Jeho najrýchlejší čas (1:23.456) je na 1. mieste
- Jeho pomalšie časy sú na 5. a 12. mieste
- Každý pokus môžete vymazať samostatne

## Technické detaily

### Zmenené súbory
1. `/src/lib/validations/ride.ts` - Odstránené `lapTime` pole
2. `/src/app/api/rides/route.ts` - Odstránené spracovanie lap time
3. `/src/app/rides/page.tsx` - Odstránené UI pole pre lap time
4. `/src/app/api/challenges/attempts/route.ts` - Zmenená GET logika, pridaný DELETE
5. `/src/app/challenge/page.tsx` - Aktualizované UI pre zobrazenie všetkých pokusov

### Databázová schéma
Žiadne zmeny v databázovej schéme - používame existujúcu tabuľku `challenge_attempts`.

### Audit Logging
- Vymazanie pokusu sa zaznamenáva do audit logu
- Obsahuje: ID pokusu, zákazníka, lap time, challenge ID

## Spustenie aplikácie

```bash
# Prvýkrát (po git pull)
cd /home/runner/work/racegarage-simulator/racegarage-simulator
npm install
npm run db:generate
npm run db:push
npm run dev

# Ďalšie spustenia
npm run dev
```

Otvorte prehliadač: http://localhost:3000

## Testovanie

### Test 1: Overenie že lap time nie je v jazde
1. Choďte na "Jazdy"
2. Kliknite "Pridať jazdu"
3. ✅ Skontrolujte že **NIE JE** žiadne pole pre "Čas okruhu"

### Test 2: Pridanie challenge času ručne
1. Choďte na "Výzva"
2. Vytvorte challenge pre aktuálny mesiac (ak neexistuje)
3. Kliknite "Pridať pokus"
4. Vyberte zákazníka
5. Zadajte čas (napr. "1:23.456")
6. ✅ Pokus sa zobrazí v rebríčku

### Test 3: Viacero pokusov od jedného zákazníka
1. Pridajte 3 pokusy pre toho istého zákazníka s rôznymi časmi
2. ✅ Všetky 3 pokusy sa zobrazia samostatne v rebríčku
3. ✅ Najrýchlejší čas bude vyššie v rebríčku

### Test 4: Vymazanie pokusu
1. Kliknite na ikonu koša pri pokuse
2. ✅ Zobrazí sa potvrdzovacie okno v slovenčine
3. Potvrďte
4. ✅ Pokus zmizne z rebríčka
5. ✅ Rebríček sa automaticky aktualizuje

## Poznámky

- **Žiadne automatické pridávanie časov** - všetky časy musia byť pridané ručne cez Challenge stránku
- **Každý pokus je samostatný** - aj keď je od toho istého zákazníka
- **Zoradenie podľa času** - najrýchlejší je prvý
- **Vymazanie je trvalé** - po vymazaní sa pokus nedá obnoviť
- **Slovenský jazyk** - všetky texty sú v slovenčine

## Budúce rozšírenia

Ak v budúcnosti budete chcieť znova pridať automatickú integráciu z formulára jazdy:
1. Obnovte pole `lapTime` v `/src/lib/validations/ride.ts`
2. Obnovte UI pole v `/src/app/rides/page.tsx`
3. Obnovte spracovanie v `/src/app/api/rides/route.ts`

Všetky tieto zmeny sú verzionované v Git commite:
- Commit 1: "Remove challenge lap time functionality from ride form"
- Commit 2: "Change challenge to show all attempts individually and add delete functionality"
