# ⚡ Rýchla oprava Vercel Deployment

## Čo sa stalo?

Dostali ste chybu:
```
vercel.json schema validation failed: env.DATABASE_URL should be string
```

## ✅ Oprava (3 kroky)

### 1. Oprávte connection string

Váš string z Neon.tech má problém. Odstráňte `&channel_binding=require`:

**❌ Váš string (ZLÝÝ):**
```
psql 'postgresql://neondb_owner:npg_n2zPtwZ8Hrdi@ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

**✅ Správny string (POUŽITE TENTO):**
```
postgresql://neondb_owner:npg_n2zPtwZ8Hrdi@ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Pridajte premenné vo Vercel Dashboard

1. Otvorte: https://vercel.com/[your-project]/settings/environment-variables

2. Kliknite **"Add New"** a pridajte:

   **DATABASE_URL:**
   ```
   postgresql://neondb_owner:npg_n2zPtwZ8Hrdi@ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   Environment: ✓ Production ✓ Preview ✓ Development

   **NEXTAUTH_SECRET:**
   ```
   # Vygenerujte príkazom: openssl rand -base64 32
   # Napríklad: dF3k9mP2xQ7vB8nC5jL1wE4rT6yU0iO9
   ```
   Environment: ✓ Production ✓ Preview ✓ Development

   **NEXTAUTH_URL:**
   ```
   https://your-app-name.vercel.app
   ```
   Environment: ✓ Production

   **EMAIL_FROM:**
   ```
   noreply@yourdomain.com
   ```
   Environment: ✓ Production ✓ Preview ✓ Development

3. Kliknite **"Save"**

### 3. Redeploy

**Možnosť A - Automaticky:**
```bash
git pull
git push
```

**Možnosť B - Manuálne:**
- Vo Vercel Dashboard → Deployments → Redeploy

---

## 🎉 Hotovo!

Vaša aplikácia by mala teraz nasadiť bez chyby.

Otvorte: `https://your-app.vercel.app`

---

## 📚 Potrebujete podrobnejší návod?

Pozrite sa do súboru: **VERCEL_ENV_SETUP.md**

---

## 💡 Poznámka

**Prečo to nefungovalo?**
- Environment variables sa NESMÚ nastaviť v `vercel.json`
- Musia sa nastaviť cez Vercel Dashboard
- Už sme to opravili, takže `vercel.json` je teraz správny ✅
