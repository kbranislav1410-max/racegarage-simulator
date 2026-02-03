# 📖 Index Dokumentácie - Problémy s Prihlásením

## 🚨 ZAČNITE TU!

Máte problém s prihlásením? Začnite podľa typu problému:

### Vidíte chybu "PrismaClientInitializationError"?
👉 **[OPRAVA_PRISMA_CHYBA.md](./OPRAVA_PRISMA_CHYBA.md)** ← NOVÁ OPRAVA!

### Vidíte chybu "POST /api/auth/login 401"?
👉 **[FIX_401_CHYBA.md](./FIX_401_CHYBA.md)** ← ČÍTAJTE TOTO PRVÉ!

### Chcete jednoduché riešenie bez čítania?
👉 **[OPRAVA_PRIHLASENIA.md](./OPRAVA_PRIHLASENIA.md)** - Jeden príkaz na opravu

### Chcete rýchle 5-krokové riešenie?
👉 **[RYCHLE_RIESENIE.md](./RYCHLE_RIESENIE.md)** - Stručný návod

### Chcete pochopiť, čo bolo zlé?
👉 **[VASHE_RIESENIE.md](./VASHE_RIESENIE.md)** - Vysvetlenie vášho problému

### Potrebujete kompletný troubleshooting?
👉 **[RIESENIE_PRIHLASENIA.md](./RIESENIE_PRIHLASENIA.md)** - Všetky možné problémy

---

## 🎯 Odporúčané Poradie Čítania

### 1️⃣ Ak máte PrismaClientInitializationError
```
OPRAVA_PRISMA_CHYBA.md
    ↓
Stiahnite opravu: git pull
    ↓
Spustite: npm run check-setup
    ↓
Ak treba: npm run fix-login
```

### 2️⃣ Ak máte 401 chybu (LOGIN NEFUNGUJE)
```
FIX_401_CHYBA.md
    ↓
Spustite: npm run fix-login
    ↓
Reštartujte aplikáciu
    ↓
Prihláste sa
```

### 3️⃣ Ak ste v plnej panike
```
OPRAVA_PRIHLASENIA.md (jeden príkaz)
    ↓
npm run fix-login
```

### 3️⃣ Ak chcete rýchle riešení
```
RYCHLE_RIESENIE.md (5 krokov)
```

### 4️⃣ Ak chcete pochopiť problém
```
VASHE_RIESENIE.md (detailné vysvetlenie)
```

### 5️⃣ Ak nič nefunguje
```
RIESENIE_PRIHLASENIA.md (kompletný troubleshooting)
```

---

## 🔧 Nástroje a Príkazy

### Automatická oprava (odporúčané)
```bash
npm run fix-login
```
Automaticky opraví všetky problémy s prihlásením.

### Diagnostika
```bash
npm run check-setup
```
Skontroluje nastavenie bez opravy.

### Manuálne kroky
```bash
# Ak treba vytvoriť .env
cp .env.example .env

# Inicializácia
npm run db:generate
npm run db:push

# Vytvorenie používateľov
npm run db:seed

# Spustenie
npm run dev
```

---

## 📚 Všetky Dokumenty

### Riešenie Prihlásenia
- **[OPRAVA_PRISMA_CHYBA.md](./OPRAVA_PRISMA_CHYBA.md)** - Riešenie PrismaClientInitializationError (NOVÉ!)
- **[FIX_401_CHYBA.md](./FIX_401_CHYBA.md)** - Riešenie 401 chyby (začnite tu!)
- **[OPRAVA_PRIHLASENIA.md](./OPRAVA_PRIHLASENIA.md)** - Jeden príkaz na opravu
- **[RYCHLE_RIESENIE.md](./RYCHLE_RIESENIE.md)** - Rýchle 5-krokové riešenie
- **[VASHE_RIESENIE.md](./VASHE_RIESENIE.md)** - Detailné vysvetlenie vášho problému
- **[RIESENIE_PRIHLASENIA.md](./RIESENIE_PRIHLASENIA.md)** - Kompletný troubleshooting

### Inštalácia a Nastavenie
- **[INSTALACIA.md](./INSTALACIA.md)** - Kompletný inštalačný návod
- **[README.md](./README.md)** - Základné informácie o projekte
- **[ZHRNUTIE_IMPLEMENTACIE.md](./ZHRNUTIE_IMPLEMENTACIE.md)** - Technické detaily

### Skripty
- `scripts/fix-login.js` - Automatická oprava prihlásenia
- `scripts/check-setup.js` - Diagnostický nástroj

---

## 🎓 Najčastejšie Otázky

### Q: Dostanem chybu "PrismaClientInitializationError" pri check-setup?
**A:** Skripty boli opravené pre Prisma 7.x. Stiahnite najnovší kód: `git pull` a skúste znova. → [OPRAVA_PRISMA_CHYBA.md](./OPRAVA_PRISMA_CHYBA.md)

### Q: Prečo mi prihlásenie nefunguje?
**A:** Tri hlavné príčiny:
1. Chýba `.env` súbor → [FIX_401_CHYBA.md](./FIX_401_CHYBA.md)
2. Používatelia neboli vytvorení → Spustite `npm run db:seed`
3. Používatelia boli vytvorení manuálne → Heslá nie sú hashované → Spustite `npm run fix-login`

### Q: Čo je to "401 chyba"?
**A:** Znamená "Unauthorized" - nesprávne heslo alebo email. Najčastejšie je to kvôli nehashovaným heslám. → [FIX_401_CHYBA.md](./FIX_401_CHYBA.md)

### Q: Môžem pridať používateľa v Prisma Studio?
**A:** **NIE!** Heslá musia byť hashované pomocou bcrypt. Vždy používajte `npm run db:seed`. → [VASHE_RIESENIE.md](./VASHE_RIESENIE.md)

### Q: Ktorý príkaz mám spustiť?
**A:** `npm run fix-login` - opraví všetko automaticky → [OPRAVA_PRIHLASENIA.md](./OPRAVA_PRIHLASENIA.md)

### Q: Ako overím, že to funguje?
**A:** Spustite `npm run check-setup` - povie vám presný stav

---

## 🔑 Testovacie Účty

Po úspešnej oprave (cez `npm run fix-login` alebo `npm run db:seed`):

| Rola | Email | Heslo | Oprávnenia |
|------|-------|-------|------------|
| Super Admin | superadmin@local.test | superadmin123! | Všetko vrátane mazania |
| Admin | admin@local.test | admin123! | Všetko okrem mazania |
| User | user@local.test | user123! | Základné, bez financií |

---

## 🎯 TL;DR (Príliš Dlhé; Nečítal Som)

```bash
# Jedno riadkové riešenie:
npm run fix-login && npm run dev

# Potom:
# - Otvorte http://localhost:3000
# - Prihláste sa: superadmin@local.test / superadmin123!
```

---

## 🆘 Kontakt

Ak nič nepomohlo:
1. Prečítajte si [RIESENIE_PRIHLASENIA.md](./RIESENIE_PRIHLASENIA.md)
2. Spustite `npm run check-setup > diagnostika.txt`
3. Vytvorte issue v GitHub s výstupom z diagnostiky

---

**Verzia:** 1.0  
**Posledná aktualizácia:** 2026-02-03  
**Jazyk:** Slovenčina 🇸🇰
