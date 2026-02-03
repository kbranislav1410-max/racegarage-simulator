# ✅ LOGO PRIDANÉ - HOTOVO!

## 🎉 Text "Racegarage" Bol Nahradený Logom

Kód bol úspešne upravený tak, aby zobrazoval vaše logo namiesto textu "Racegarage".

---

## 📍 Kde sa Logo Zobrazuje

### 1. ✅ Prihlasovacia Stránka
- **Pozícia:** Hore v strede prihlasovacej karty
- **Namiesto:** Textu "Racegarage"
- **Veľkosť:** Maximum 200px šírka

### 2. ✅ Sidebar (Bočné Menu)
- **Pozícia:** Hore v ľavom bočnom menu
- **Namiesto:** Textu "Racegarage"
- **Veľkosť:** Maximum 150px šírka

---

## 🚀 ČO MUSÍTE TERAZ UROBIŤ

### Krok 1: Stiahnite Kód
```bash
git pull origin copilot/add-user-roles-superadmin-admin-user
```

### Krok 2: Stiahnite Logo
1. Otvorte: https://drive.google.com/file/d/13hEWlmaaeNAgOSLLfYAjWzAMjfvwpXu_/view?usp=sharing
2. Kliknite na **"Stiahnuť"** (Download)
3. Uložte súbor

### Krok 3: Premenujte Logo
Premenujte stiahnutý súbor na: **`logo.png`**

### Krok 4: Umiestnite Logo
Skopírujte `logo.png` do:
```
racegarage-simulator/
  public/
    logo.png  <-- Tu!
```

### Krok 5: Reštartujte Aplikáciu
```bash
# Zastavte (Ctrl+C)
npm run dev
```

### Krok 6: Otvorte a Overte
```
http://localhost:3000/login
```

**Mali by ste vidieť:**
- ✅ Vaše logo na prihlasovacej stránke
- ✅ Vaše logo v sidebar po prihlásení

---

## 📊 Zmeny v Kóde

### Pred:
```tsx
<h1 className="text-3xl font-bold text-white">Racegarage</h1>
```

### Po:
```tsx
<img 
  src="/logo.png" 
  alt="Racegarage Logo" 
  className="max-w-[200px] h-auto mx-auto mb-2"
/>
```

---

## 📁 Súbory Zmenené

1. ✅ **src/app/login/page.tsx** - Logo na prihlásení
2. ✅ **src/components/Sidebar.tsx** - Logo v bočnom menu
3. ✅ **.gitignore** - Logo súbory ignorované (necommitujú sa)
4. ✅ **PRIDANIE_LOGA.md** - Podrobný návod

---

## 🎨 Podporované Formáty

Logo môže byť:
- ✅ **PNG** (odporúčané - podporuje priehľadnosť)
- ✅ **JPG/JPEG**
- ✅ **SVG** (najlepšie pre ostrosť)
- ✅ **WebP**

**Poznámka:** Ak použijete iný formát ako PNG, upravte v kóde:
```tsx
src="/logo.jpg"  // pre JPG
src="/logo.svg"  // pre SVG
```

---

## ⚙️ Prispôsobenie Veľkosti

### Ak je Logo Príliš Veľké/Malé:

#### Prihlasovacia Stránka:
V `src/app/login/page.tsx`, zmeňte `max-w-[200px]`:
```tsx
className="max-w-[150px] h-auto mx-auto mb-2"  // Menšie
className="max-w-[250px] h-auto mx-auto mb-2"  // Väčšie
```

#### Sidebar:
V `src/components/Sidebar.tsx`, zmeňte `max-w-[150px]`:
```tsx
className="max-w-[120px] h-auto mb-1"  // Menšie
className="max-w-[180px] h-auto mb-1"  // Väčšie
```

---

## 🔍 Riešenie Problémov

### Logo sa Nezobrazuje?

#### 1. Overte Umiestnenie
```bash
ls -la public/logo.png
```
✅ Súbor **musí** byť v `public/logo.png`

#### 2. Overte Názov
- Presne: `logo.png` (malé písmená)
- V priečinku `public/` (nie `src/`)

#### 3. Reštartujte Aplikáciu
```bash
npm run dev
```

#### 4. Vyčistite Cache
- `Ctrl+F5` (Windows/Linux)
- `Cmd+Shift+R` (Mac)

### Logo je Rozmazané?
- Použijte 2x rozlíšenie (napr. 800px šírka)
- Alebo SVG formát pre perfektnú ostrosť

---

## 📖 Podrobná Dokumentácia

Pre úplný návod s obrázkami a detailami:
👉 **[PRIDANIE_LOGA.md](./PRIDANIE_LOGA.md)**

Obsahuje:
- Podrobné kroky
- Troubleshooting
- Všetky možnosti prispôsobenia
- FAQ

---

## ✅ Kontrolný Zoznam

Pred testovaním:

- [ ] Stiahnutý kód: `git pull`
- [ ] Stiahnuté logo z Google Drive
- [ ] Premenované na `logo.png`
- [ ] Umiestnené v `public/logo.png`
- [ ] Aplikácia reštartovaná: `npm run dev`
- [ ] Otvorená stránka: `http://localhost:3000/login`
- [ ] Logo sa zobrazuje ✅

---

## 🎯 Výsledok

**Po dokončení:**
```
┌────────────────────────────────┐
│                                │
│        [VAŠE LOGO]            │
│    Simulator Management        │
│          System                │
│                                │
│    Email                       │
│    [___________________]       │
│                                │
│    Heslo                       │
│    [___________________]       │
│                                │
│    [  Prihlásiť sa  ]         │
│                                │
└────────────────────────────────┘
```

**A v sidebar:**
```
┌──────────────────┐
│  [VAŠE LOGO]     │
│  Simulator       │
│                  │
│  📊 Prehľad      │
│  👥 Zákazníci    │
│  🚗 Jazdy        │
│  ...             │
└──────────────────┘
```

---

## 💡 Dôležité

### Logo Súbor NIE je v Git Repozitári
- Logo je v `.gitignore`
- Každý vývojár musí pridať súbor lokálne
- Toto zabezpečuje flexibilitu a menšiu veľkosť repo

### Jeden Súbor = Všade
- Stačí pridať `public/logo.png`
- Automaticky sa zobrazí na prihlásení aj v sidebar
- Žiadne ďalšie nastavenie nie je potrebné

---

## 🎉 Hotovo!

Text "Racegarage" bol úspešne nahradený vašim logom!

**Teraz len:**
1. Stiahnite kód
2. Pridajte logo do `public/logo.png`
3. Reštartujte aplikáciu
4. Užívajte si vaše logo! 🚀
