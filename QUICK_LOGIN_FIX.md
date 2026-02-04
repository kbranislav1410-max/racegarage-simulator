# Rýchle riešenie: Internal Server Error pri prihlásení

## Stav: Aplikácia je online, ale prihlásenie nefunguje ❌

URL: https://racegarage-simulator-fi-git-0176e7-kbranislav1410-maxs-projects.vercel.app/login

## Čo treba urobiť (3 kroky)

### Krok 1: Skontroluj Vercel logs (zisti príčinu)

1. Choď na: https://vercel.com/[tvoj-projekt]/deployments
2. Klikni na najnovší deployment
3. Klikni na **Functions** tab
4. Nájdi `POST /api/auth/login`
5. Pozri si error message

**Uvidíš niečo ako:**
```
[LOGIN] Error message: DATABASE_URL is not defined
```
alebo
```
[LOGIN] User found: No
```

### Krok 2: Aplikuj riešenie podľa erroru

#### Ak vidíš: "DATABASE_URL is not defined"

**Riešenie:**
1. Vercel Dashboard → Settings → Environment Variables
2. Klikni **Add New**
3. Name: `DATABASE_URL`
4. Value: 
   ```
   postgresql://neondb_owner:npg_n2zPtwZ8Hrdi@ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   ⚠️ **BEZ** `&channel_binding=require`!
5. Environment: Všetky (Production, Preview, Development)
6. Klikni **Save**

#### Ak vidíš: "User found: No"

**Riešenie:**
Seeduj databázu:
```bash
DATABASE_URL="postgresql://neondb_owner:npg_n2zPtwZ8Hrdi@ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" npm run db:seed
```

**Očakávaný výstup:**
```
🌱 Starting database seed...
✅ Created SUPER_ADMIN user: superadmin@local.test
✅ Created ADMIN user: admin@local.test
✅ Created USER: user@local.test
🎉 Database seeding completed!
```

### Krok 3: Redeploy a otestuj

1. **Redeploy:**
   - Vercel Dashboard → Deployments
   - Klikni **...** → **Redeploy**
   - Počkaj 2-3 minúty

2. **Test:**
   - Choď na login URL
   - Email: `superadmin@local.test`
   - Heslo: `superadmin123!`
   - Klikni **Prihlásiť sa**

**Malo by fungovať!** ✅

---

## Najčastejšia chyba

**DATABASE_URL nie je nastavená v Vercel** (80% prípadov)

Vercel environment variables sú oddelené od lokálneho `.env` súboru!

**Riešenie:**
Musíš pridať DATABASE_URL manuálne v Vercel Dashboard → Settings → Environment Variables

---

## Ďalšie zdroje

- Kompletný troubleshooting guide: **INTERNAL_SERVER_ERROR.md**
- Deployment guide: **DEPLOYMENT_WEBSUPPORT.md**
- Environment setup: **VERCEL_ENV_SETUP.md**

---

## Zhrnutie

1. ✅ Aplikácia je nasadená
2. ❌ Prihlásenie nefunguje
3. 🔍 Skontroluj Vercel logs
4. 🛠️ Pridaj DATABASE_URL alebo seeduj DB
5. 🔄 Redeploy
6. ✅ Hotovo!
