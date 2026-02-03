# 🎨 PRIDANIE LOGA - NÁVOD

## 📥 Ako Pridať Logo

### Krok 1: Stiahnite Logo z Google Drive

1. Otvorte odkaz: https://drive.google.com/file/d/13hEWlmaaeNAgOSLLfYAjWzAMjfvwpXu_/view?usp=sharing
2. Kliknite na tlačidlo **"Stiahnuť"** (Download) v pravom hornom rohu
3. Uložte súbor na počítač

### Krok 2: Premenujte Súbor

Premenujte stiahnutý súbor na: **`logo.png`**

(Alebo `logo.jpg`, `logo.svg` - podľa formátu vášho loga)

### Krok 3: Umiestnite Logo do Projektu

Skopírujte súbor `logo.png` do priečinka:
```
racegarage-simulator/
  public/
    logo.png  <-- Tu!
```

### Krok 4: Reštartujte Aplikáciu

```bash
# Ak aplikácia beží, zastavte ju (Ctrl+C)
npm run dev
```

### Krok 5: Overte Zobrazenie

Logo by sa malo zobraziť na:
- ✅ Prihlasovacej stránke (http://localhost:3000/login)
- ✅ V bočnom menu (sidebar) po prihlásení

---

## 🎯 Kde sa Logo Zobrazuje

### 1. Prihlasovacia Stránka
- **Miesto:** Hore v strede prihlasovacej karty
- **Namiesto:** Textu "Racegarage"
- **Veľkosť:** Automaticky prispôsobená (max. 200px šírka)

### 2. Sidebar (Bočné Menu)
- **Miesto:** Hore v ľavom paneli
- **Namiesto:** Textu "Racegarage"
- **Veľkosť:** Automaticky prispôsobená (max. 150px šírka)

---

## 🖼️ Podporované Formáty

Logo môže byť v týchto formátoch:
- ✅ **PNG** (odporúčané - podporuje priehľadnosť)
- ✅ **JPG/JPEG**
- ✅ **SVG** (najlepšie pre ostrosť)
- ✅ **WebP**

### Odporúčané Rozlíšenie:
- **Šírka:** 400-800 px
- **Výška:** 100-200 px
- **Pomer strán:** Široké horizontálne logo

---

## ⚙️ Zmeny v Kóde

### Súbory Zmenené:
1. **`src/app/login/page.tsx`** - Prihlasovacia stránka
2. **`src/components/Sidebar.tsx`** - Bočné menu

### Čo Bolo Zmenené:

#### Pred:
```tsx
<h1 className="text-3xl font-bold text-white">Racegarage</h1>
```

#### Po:
```tsx
<img 
  src="/logo.png" 
  alt="Racegarage Logo" 
  className="max-w-[200px] h-auto mx-auto"
/>
```

---

## 🎨 Prispôsobenie Veľkosti

Ak chcete zmeniť veľkosť loga:

### Prihlasovacia Stránka:
V súbore `src/app/login/page.tsx`, zmeňte `max-w-[200px]`:
```tsx
className="max-w-[150px] h-auto mx-auto"  // Menšie logo
className="max-w-[250px] h-auto mx-auto"  // Väčšie logo
```

### Sidebar:
V súbore `src/components/Sidebar.tsx`, zmeňte `max-w-[150px]`:
```tsx
className="max-w-[120px] h-auto"  // Menšie logo
className="max-w-[180px] h-auto"  // Väčšie logo
```

---

## 🔍 Riešenie Problémov

### Logo sa Nezobrazuje?

#### 1. Overte Umiestnenie Súboru
```bash
ls -la public/logo.png
```
Súbor **musí** byť v `public/logo.png`

#### 2. Overte Názov Súboru
- Musí byť presne: `logo.png` (malé písmená)
- Ak máte iný formát, upravte kód:
  ```tsx
  src="/logo.jpg"  // pre JPG
  src="/logo.svg"  // pre SVG
  ```

#### 3. Reštartujte Aplikáciu
```bash
# Zastavte (Ctrl+C)
npm run dev
```

#### 4. Vyčistite Cache Prehliadača
- Stlačte `Ctrl+F5` (Windows/Linux)
- Alebo `Cmd+Shift+R` (Mac)

### Logo je Príliš Veľké/Malé?

Upravte veľkosť v kóde (pozrite sekciu "Prispôsobenie Veľkosti" vyššie).

### Logo sa Zobrazuje Rozmazané?

- Použite vyššie rozlíšenie (2x, napr. 800px šírka)
- Alebo použite SVG formát pre perfektnú ostrosť

---

## 📝 Alternatíva: Použitie Iného Názvu Súboru

Ak chcete použiť iný názov súboru:

1. **Umiestnite súbor** do `public/` (napr. `moje-logo.png`)

2. **Upravte kód** v `src/app/login/page.tsx`:
   ```tsx
   src="/moje-logo.png"
   ```

3. **Upravte kód** v `src/components/Sidebar.tsx`:
   ```tsx
   src="/moje-logo.png"
   ```

---

## ✅ Kontrolný Zoznam

Pred testovaním overte:

- [ ] Logo stiahnuté z Google Drive
- [ ] Súbor premenovaný na `logo.png`
- [ ] Súbor umiestnený v `public/logo.png`
- [ ] Aplikácia reštartovaná
- [ ] Cache prehliadača vyčistená
- [ ] Otvorené prihlasovacie stránka
- [ ] Logo sa zobrazuje na prihlásení
- [ ] Logo sa zobrazuje v sidebar

---

## 🎉 Výsledok

Po dokončení všetkých krokov:
- ✅ Na prihlasovacej stránke sa zobrazuje vaše logo namiesto textu "Racegarage"
- ✅ V sidebar (bočnom menu) sa zobrazuje vaše logo namiesto textu "Racegarage"
- ✅ Logo je automaticky prispôsobené veľkosti
- ✅ Logo vyzerá profesionálne a moderne

---

**Poznámka:** Súbor loga nie je zahrnutý v repozitári (je v `.gitignore`), takže každý vývojár musí pridať svoj vlastný súbor loga lokálne.
