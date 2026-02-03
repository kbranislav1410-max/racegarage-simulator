# Oprava Farby Textu v Input Poliach

## Problém
Text v poliach na zadávanie údajov (input fields) bol veľmi svetlý a nebolo vidieť čo sa do nich píše.

## Riešenie
Pridali sme globálne CSS pravidlá ktoré nastavujú tmavú farbu textu pre všetky input polia v celej aplikácii.

---

## Čo bolo zmenené

### Pridané CSS pravidlá v `src/app/globals.css`

```css
/* Improve input field text visibility */
input,
textarea,
select {
  color: #0f172a !important; /* slate-900 - veľmi tmavá sivá */
}

/* Keep placeholder text visible but lighter */
input::placeholder,
textarea::placeholder {
  color: #94a3b8 !important; /* slate-400 - svetlejší ale viditeľný */
  opacity: 1;
}

/* Ensure disabled inputs are still readable */
input:disabled,
textarea:disabled,
select:disabled {
  color: #64748b !important; /* slate-500 - stredná sivá */
  opacity: 0.7;
}
```

### Farby použité:
- **Aktívny text:** `#0f172a` (slate-900) - Veľmi tmavá sivá pre maximálnu čitateľnosť
- **Placeholder:** `#94a3b8` (slate-400) - Svetlejší ale stále dobre viditeľný
- **Disabled polia:** `#64748b` (slate-500) - Stredná sivá pre zakázané polia

---

## Výhody tohto riešenia

✅ **Globálne:** Platí pre všetky input polia v celej aplikácii
✅ **Konzistentné:** Všetky stránky majú rovnakú farbu
✅ **Jednoduché:** Netreba meniť každý komponent jednotlivo
✅ **Čitateľné:** Text je teraz veľmi dobre viditeľný
✅ **Prehľadné:** Placeholder text je odlíšený ale stále čitateľný

---

## Kde sa zmena prejaví

Táto zmena ovplyvní všetky formuláre a input polia v aplikácii:

### 1. Login stránka
- Email input
- Password input

### 2. Zákazníci (Customers)
- Hľadanie zákazníkov
- Vytváranie nového zákazníka:
  - Email
  - Meno
  - Priezvisko
  - Ulica
  - Mesto
  - Telefón

### 3. Jazdy (Rides)
- Všetky polia vo formulári pre pridanie jazdy:
  - Dátum
  - Čas
  - Minúty
  - Poznámky
  - Suma platby
  - Kód voucheru

### 4. Challenge (Výzva)
- Vytvorenie challenge:
  - Názov trate
  - Názov auta
  - Trvanie
- Pridanie pokusu:
  - Čas okruhu

### 5. Rezervácie (Reservations)
- Všetky polia rezervačného formulára

### 6. Platby (Payments)
- Polia pre zaznamenanie platby

### 7. Vouchery (Vouchers)
- Vytvorenie voucheru:
  - Email príjemcu
  - Meno
  - Počet minút
- Kontrola voucheru:
  - Kód voucheru

### 8. Nastavenia (Settings)
- Všetky konfiguračné polia:
  - Názov firmy
  - Email
  - Ceny
  - Pracovné hodiny

---

## Ako to otestovať

### 1. Stiahnite zmeny
```bash
git pull
```

### 2. Nainštalujte závislosti (ak ešte nemáte)
```bash
npm install
```

### 3. Spustite vývojový server
```bash
npm run dev
```

### 4. Otvorte aplikáciu
Otvorte v prehliadači: http://localhost:3000

### 5. Vyskúšajte input polia
- Choďte na login stránku - skúste písať do emailu a hesla
- Prihláste sa a choďte do Settings - vyskúšajte zmeniť nastavenia
- Choďte do Customers - vyskúšajte vytvoriť nového zákazníka
- Skúste akýkoľvek formulár v aplikácii

**Text by mal byť teraz tmavý a perfektne viditeľný!** ✅

---

## Technické detaily

### Prečo `!important`?
Použili sme `!important` aby sme zaistili, že naše globálne pravidlo prepíše všetky lokálne štýly z komponentov. Toto je dôležité pretože:
- Niektoré komponenty môžu mať vlastné inline štýly
- Tailwind CSS môže mať svoje farby
- Chceme konzistentnú farbu v celej aplikácii

### Prečo globálne pravidlo?
Alternatíva by bola:
1. Prejsť každý súbor s formulárom
2. Pridať `text-slate-900` do className každého inputu
3. To by znamenalo zmeny v ~15+ súboroch
4. Bolo by to ťažšie udržiavať

Globálne pravidlo je:
- Jednoduchšie
- Rýchlejšie implementovať
- Ľahšie udržiavať
- Konzistentnejšie

---

## Pred a po

### Pred opravou ❌
```
Input text color: Svetlo sivá (#d1d5db alebo podobná)
Placeholder: Ešte svetlejšia
Výsledok: Ťažko čitateľné, musíte sa veľmi namáhať
```

### Po oprave ✅
```
Input text color: Tmavo sivá (#0f172a)
Placeholder: Stredne svetlá sivá (#94a3b8)
Výsledok: Perfektne čitateľné, jasne viditeľné
```

---

## Riešenie problémov

### Ak zmeny nevidíte
1. Obnovte prehliadač (Ctrl+F5 alebo Cmd+Shift+R)
2. Vyčistite cache prehliadača
3. Reštartujte vývojový server:
   ```bash
   # Zastavte server (Ctrl+C)
   npm run dev
   ```

### Ak máte problémy s farbou
Skontrolujte že:
1. Súbor `src/app/globals.css` obsahuje nové CSS pravidlá
2. Server je spustený (`npm run dev`)
3. Prehliadač načítal najnovšie štýly (obnovte stránku)

---

## Zhrnutie

✅ **Problém vyriešený:** Text v input poliach je teraz tmavý a dobre viditeľný
✅ **Globálna zmena:** Platí pre celú aplikáciu
✅ **Jednoduchá implementácia:** Len 1 súbor zmenený
✅ **Konzistentná:** Všetky polia majú rovnakú farbu
✅ **Udržateľná:** Ľahko sa spravuje v budúcnosti

**Teraz môžete pohodlne písať do všetkých polí v aplikácii!** 🎉
