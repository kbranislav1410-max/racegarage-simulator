# Pridanie Pozadia na Prihlasovaciu Stránku

## Ako Pridať Obrázok Pozadia

### Krok 1: Stiahnite Obrázok z Google Drive

1. Otvorte odkaz: https://drive.google.com/file/d/1R3nzvN5GeVACTLQDod0UPr71KVJFX17p/view?usp=sharing
2. Kliknite na "Stiahnuť" (Download) v pravom hornom rohu
3. Uložte súbor

### Krok 2: Premenujte Súbor

Premenujte stiahnutý súbor na: `login-bg.jpg`

### Krok 3: Umiestnite Súbor do Projektu

Skopírujte súbor `login-bg.jpg` do priečinka:
```
public/login-bg.jpg
```

V priečinku projektu:
```
racegarage-simulator/
  public/
    login-bg.jpg  <-- Tu umiestnite súbor
  src/
  ...
```

### Krok 4: Reštartujte Aplikáciu

Ak aplikácia beží, reštartujte ju:
```bash
# Zastavte (Ctrl+C)
npm run dev
```

## Výsledok

Po pridaní obrázka by ste mali vidieť:
- ✅ Pozadie prihlasovacej stránky s vaším obrázkom
- ✅ Šedý prihlasovací box (#292929)
- ✅ Tmavošedé vstupné polia (#1a1a1a) bez ohraničenia
- ✅ Červené tlačidlo (#c20003)
- ✅ Biely text

## Alternatíva: Použitie Iného Obrázka

Ak chcete použiť iný obrázok:
1. Uložte ho do `public/` priečinka
2. Upravte `src/app/login/page.tsx`, riadok s `backgroundImage`:
   ```typescript
   backgroundImage: 'url(/názov-vášho-obrázka.jpg)'
   ```

## Poznámky

- Obrázok musí byť v `public/` priečinku (nie v `src/`)
- Podporované formáty: `.jpg`, `.jpeg`, `.png`, `.webp`
- Odporúčaná veľkosť: 1920x1080 alebo vyššia pre lepšiu kvalitu
