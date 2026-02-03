# 🚨 RIEŠENIE VÁŠHO PROBLÉMU

## Vidíte túto chybu v termináli?

```
POST /api/auth/login 401 in 164ms
```

**Toto znamená:** Prihlásenie zlyhalo, heslá sa nezhodujú!

---

## ⚡ JEDNODUCHÉ RIEŠENIE (1 príkaz):

```bash
npm run fix-login
```

### Čo sa stane:

1. **Skript skontroluje váš projekt**
   - Nájde chýbajúce súbory (.env)
   - Overí databázové pripojenie
   - Zistí, či máte používateľov

2. **Automaticky opraví problémy**
   - Vytvorí .env (ak chýba)
   - Vymaže používateľov s nesprávnymi heslami
   - Vytvorí nových používateľov so správnymi hashovanými heslami

3. **Povie vám, čo robiť ďalej**
   - Či treba upraviť .env
   - Či treba reštartovať aplikáciu

---

## 📝 PRESNÉ KROKY:

### Krok 1: Zastavte aplikáciu
V termináli kde beží `npm run dev`, stlačte **Ctrl+C**

### Krok 2: Spustite opravu
```bash
npm run fix-login
```

### Krok 3: Nasledujte inštrukcie

**Ak script povie "Upravte DATABASE_URL":**
1. Otvorte súbor `.env` 
2. Nájdite riadok `DATABASE_URL=...`
3. Zmeňte ho na:
   ```
   DATABASE_URL="******localhost:5432/racegarage_simulator"
   ```
4. Uložte súbor
5. Spustite znova: `npm run fix-login`

**Ak script povie "HOTOVO!":**
- Pokračujte na Krok 4

### Krok 4: Reštartujte aplikáciu
```bash
npm run dev
```

### Krok 5: Vyčistite cache prehliadača
1. Otvorte prehliadač na `http://localhost:3000`
2. Stlačte **F12** (otvorí DevTools)
3. Kliknite na záložku **Application**
4. V ľavom menu: **Local Storage** → `http://localhost:3000`
5. Kliknite pravým tlačidlom → **Clear**
6. Obnovte stránku (**F5**)

### Krok 6: Prihláste sa
Použite jeden z týchto účtov:

```
Email: superadmin@local.test
Heslo: superadmin123!
```

alebo

```
Email: admin@local.test
Heslo: admin123!
```

alebo

```
Email: user@local.test
Heslo: user123!
```

---

## ✅ VERIFIKÁCIA

**Ako zistím, že to funguje?**

Po spustení `npm run fix-login` by ste mali vidieť:

```
🎉 HOTOVO!
==============================================================

✅ Prihlásenie bolo opravené!

Testovacie účty:
  • superadmin@local.test / superadmin123!
  • admin@local.test / admin123!
  • user@local.test / user123!
```

**Ak vidíte:**
```
✅ VŠETKO JE V PORIADKU!
```
Potom je všetko správne nastavené!

---

## 🔍 ČO BOLO ZLÉ?

### Problém 1: Chýbal .env súbor
- Aplikácia sa nemohla pripojiť k databáze
- Riešenie: Skript vytvoril .env zo .env.example

### Problém 2: Používatelia s nehashovanými heslami
Keď ste pridali používateľa v Prisma Studio, zadali ste heslo ako:
```
password123
```

Ale aplikácia očakáva hashované heslo:
```
$2a$10$XYZ123ABC... (dlhý náhodný string)
```

**Preto prihlásenie zlyhalo s 401!**

### Riešenie:
Skript vymazal starých používateľov a vytvoril nových so správnymi bcrypt hashovanými heslami.

---

## 🆘 AK STÁLE NEFUNGUJE

### Skontrolujte PostgreSQL

**Pre Docker:**
```bash
docker ps
```
Mali by ste vidieť kontajner s postgres.

**Pre lokálny PostgreSQL:**
```bash
psql -h localhost -U postgres
```
Ak sa pripojíte, PostgreSQL beží.

### Skontrolujte logy

V termináli kde beží `npm run dev` sledujte výstup. Pri prihlásení by mali byť:

✅ **Správne:**
```
POST /api/auth/login 200 in 150ms
```

❌ **Zlé:**
```
POST /api/auth/login 401 in 164ms
```

### Skontrolujte Browser Console

1. F12 → Console
2. Pokúste sa prihlásiť
3. Hľadajte červené chyby

---

## 📚 ĎALŠIA POMOC

Ak potrebujete viac informácií:

1. **[OPRAVA_PRIHLASENIA.md](./OPRAVA_PRIHLASENIA.md)** - Rýchly návod
2. **[VASHE_RIESENIE.md](./VASHE_RIESENIE.md)** - Detailné vysvetlenie
3. **[RIESENIE_PRIHLASENIA.md](./RIESENIE_PRIHLASENIA.md)** - Kompletný troubleshooting

---

## 💡 ZHRNUTIE V 3 BODOCH

1. **Spustite:** `npm run fix-login`
2. **Reštartujte:** `npm run dev`
3. **Prihláste sa:** `superadmin@local.test` / `superadmin123!`

**Hotovo!** 🎉
