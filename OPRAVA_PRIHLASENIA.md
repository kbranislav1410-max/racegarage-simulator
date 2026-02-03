# ⚡ RÝCHLA OPRAVA PRIHLÁSENIA

## Ak prihlásenie stále nefunguje, použite tento príkaz:

```bash
npm run fix-login
```

## Čo tento príkaz urobí?

Automaticky opraví všetky problémy s prihlásením:

1. ✅ Skontroluje a vytvorí `.env` súbor (ak chýba)
2. ✅ Overí pripojenie k databáze
3. ✅ Skontroluje existenciu tabuliek
4. ✅ Vymaže nesprávne vytvorených používateľov (s nehashovanými heslami)
5. ✅ Vytvorí nových používateľov so správnymi hashovanými heslami
6. ✅ Overí, že všetko funguje

## Po spustení príkazu:

```bash
npm run fix-login
```

**Ak sa vytvoril nový `.env` súbor:**
1. Otvorte súbor `.env` v textovom editore
2. Upravte `DATABASE_URL` na správnu adresu vašej databázy
3. Spustite príkaz znova: `npm run fix-login`

**Po dokončení:**
1. Reštartujte aplikáciu:
   ```bash
   # Zastavte npm run dev (Ctrl+C)
   npm run dev
   ```
2. Vyčistite cache prehliadača (F12 → Application → Local Storage → Clear)
3. Prihláste sa jedným z testovacích účtov

## Testovacie účty:

Po úspešnej oprave môžete použiť:

| Rola | Email | Heslo |
|------|-------|-------|
| Super Admin | superadmin@local.test | superadmin123! |
| Admin | admin@local.test | admin123! |
| User | user@local.test | user123! |

## Príklad použitia:

```bash
# V priečinku projektu spustite:
npm run fix-login

# Počkajte na dokončenie (malo by to trvať pár sekúnd)

# Ak sa objaví hlásenie o DATABASE_URL:
# 1. Upravte .env súbor
# 2. Spustite znova: npm run fix-login

# Po úspešnej oprave:
# Ctrl+C (zastavte dev server)
npm run dev

# Otvorte http://localhost:3000 a prihláste sa
```

## Diagnostika:

Ak chcete len skontrolovať stav bez opravy:

```bash
npm run check-setup
```

## Ak stále nefunguje:

1. Skontrolujte, či PostgreSQL beží:
   ```bash
   # Pre Docker:
   docker ps
   
   # Pre lokálny PostgreSQL:
   psql -h localhost -U postgres -d racegarage_simulator
   ```

2. Skontrolujte logy aplikácie v termináli kde beží `npm run dev`

3. Skontrolujte Browser Console (F12 → Console)

4. Prečítajte si: [VASHE_RIESENIE.md](./VASHE_RIESENIE.md)

---

**TL;DR:** Spustite `npm run fix-login` a nasledujte inštrukcie. 🚀
