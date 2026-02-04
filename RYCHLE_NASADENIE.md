# ⚡ RÝCHLY ŠTART - NASADENIE

## Najrýchlejší Spôsob Nasadenia (15 minút)

### 🎯 Odporúčaný Postup: Vercel + Neon

---

## KROK 1: Databáza (5 minút)

### Vytvorte PostgreSQL databázu na Neon.tech:

1. **Otvorte:** https://neon.tech
2. **Zaregistrujte sa** cez GitHub
3. **Vytvorte projekt:** "racegarage"
4. **Región:** Frankfurt (EU)
5. **Skopírujte Connection String:**
   ```
   postgresql://user:pass@host.neon.tech/racegarage
   ```

✅ **Máte DATABASE_URL!**

---

## KROK 2: Hosting (5 minút)

### Nasaďte na Vercel:

1. **Otvorte:** https://vercel.com
2. **Prihláste sa** cez GitHub
3. **Kliknite:** "Add New Project"
4. **Vyberte repozitár:** `racegarage-simulator`
5. **Import**

✅ **Projekt importovaný!**

---

## KROK 3: Konfigurácia (3 minúty)

### V Vercel projekte:

1. Choďte na **Settings → Environment Variables**
2. Pridajte:

```bash
DATABASE_URL=postgresql://user:pass@host.neon.tech/racegarage
```

3. Kliknite **Save**
4. Choďte na **Deployments**
5. Kliknite **"Redeploy"** na najnovšom deploye

✅ **Aplikácia sa buduje!**

---

## KROK 4: Inicializácia DB (2 minúty)

### Lokálne spustite:

```bash
# 1. Nastavte DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host.neon.tech/racegarage"

# 2. Vytvorte tabuľky
npx prisma db push

# 3. Vytvorte používateľov
npm run db:seed
```

✅ **Databáza pripravená!**

---

## KROK 5: Doména (voliteľné)

### Pripojte vašu doménu:

1. V Vercel: **Settings → Domains**
2. Pridajte: `vasadomena.sk`
3. Na websupport.sk pridajte DNS:

```
@    A    76.76.21.21
www  CNAME  cname.vercel-dns.com
```

4. Počkajte 15-60 minút

✅ **Hotovo!**

---

## 🎉 VAŠA APLIKÁCIA JE ONLINE!

### URL:
- Vercel: `https://racegarage-simulator.vercel.app`
- Vaša doména: `https://vasadomena.sk` (po nastavení DNS)

### Prihlasovacie Údaje:

**Super Admin:**
- Email: `superadmin@local.test`
- Heslo: `superadmin123!`

**Admin:**
- Email: `admin@local.test`
- Heslo: `admin123!`

**User:**
- Email: `user@local.test`
- Heslo: `user123!`

---

## 📱 Otvorte a Testujte:

```
https://racegarage-simulator.vercel.app/login
```

---

## 🔄 Aktualizácie

```bash
# Pushnutie zmien = automatický deploy
git add .
git commit -m "Update"
git push

# Vercel automaticky nasadí novú verziu!
```

---

## ❓ Problémy?

Pozrite: **[DEPLOYMENT_WEBSUPPORT.md](./DEPLOYMENT_WEBSUPPORT.md)** - kompletný návod

---

## 💡 Tipy

### Bezplatné Služby Použité:
- ✅ Vercel (hosting) - zadarmo
- ✅ Neon.tech (databáza) - zadarmo do 0.5GB
- ✅ GitHub (kód) - zadarmo

### Náklady:
- **€0/mesiac** pre základné použitie
- Vaša websupport.sk doména - cena podľa tarifu

### Výkon:
- Globálna CDN
- Automatický SSL
- Serverless functions
- Instant scaling

---

## 🚀 To Je Všetko!

Za 15 minút máte produkčnú aplikáciu online! 🎉
