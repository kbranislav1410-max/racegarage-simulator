# ⚡ Rýchle Riešenie Prihlásenia

**Problém:** Prihlásenie nefunguje, tabuľka users je prázdna.

## 🔧 Riešenie v 5 Krokoch

### Krok 1: Vytvorte `.env` súbor

```bash
# Skopírujte .env.example
cp .env.example .env

# Alebo na Windows PowerShell:
Copy-Item .env.example .env
```

### Krok 2: Nastavte DATABASE_URL v `.env`

Otvorte `.env` súbor a upravte DATABASE_URL:

```env
DATABASE_URL="postgresql://postgres:vase_heslo@localhost:5432/racegarage_simulator"
```

**Pre Docker:**
```env
DATABASE_URL="postgresql://simulator:simulator@localhost:5432/simulator"
```

### Krok 3: Inicializujte Databázu

```bash
npm run db:generate
npm run db:push
```

### Krok 4: Vytvorte Používateľov

```bash
npm run db:seed
```

**Očakávaný výstup:**
```
🌱 Starting database seed...
✅ Created SUPER_ADMIN user: superadmin@local.test
✅ Created ADMIN user: admin@local.test
✅ Created USER: user@local.test
🎉 Database seeding completed!
```

### Krok 5: Reštartujte Aplikáciu

```bash
# Zastavte aplikáciu (Ctrl+C v termináli kde beží)
# Potom spustite znova:
npm run dev
```

## ✅ Overenie

Spustite diagnostický skript:

```bash
npm run check-setup
```

Mal by vypísať:
```
✅ VŠETKO JE V PORIADKU!
```

## 🔑 Testovacie Účty

Po úspešnom seede môžete použiť:

| Rola | Email | Heslo |
|------|-------|-------|
| Super Admin | superadmin@local.test | superadmin123! |
| Admin | admin@local.test | admin123! |
| User | user@local.test | user123! |

## ⚠️ Dôležité Poznámky

- **NIKDY** nepridávajte používateľov manuálne cez Prisma Studio!
- Heslá musia byť hashované pomocou bcrypt
- Ak ste pridali používateľa manuálne, vymažte ho a spustite `npm run db:seed`
- Vždy vyčistite cache prehliadača po zmene používateľov (F12 → Application → Local Storage → Clear)

## 🆘 Ak Nefunguje

1. Skontrolujte, či PostgreSQL beží:
   ```bash
   # Docker:
   docker ps
   
   # Lokálny PostgreSQL - skúste sa pripojiť:
   psql -h localhost -U postgres -d racegarage_simulator
   ```

2. Skontrolujte .env súbor:
   ```bash
   cat .env
   ```

3. Prečítajte si podrobný návod: [RIESENIE_PRIHLASENIA.md](./RIESENIE_PRIHLASENIA.md)

## 🎯 Jeden Príkaz Pre Všetko

Ak potrebujete začať od začiatku:

```bash
# Vytvorte .env (ak neexistuje)
cp .env.example .env

# Nastavte DATABASE_URL v .env, potom:
npm run db:generate && npm run db:push && npm run db:seed && npm run dev
```

---

**Ešte otázky?** Prečítajte si [RIESENIE_PRIHLASENIA.md](./RIESENIE_PRIHLASENIA.md) alebo [INSTALACIA.md](./INSTALACIA.md)
