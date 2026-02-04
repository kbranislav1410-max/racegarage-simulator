# Nastavenie Environment Variables vo Vercel

## Problém ktorý sme riešili

Dostali ste chybu:
```
The `vercel.json` schema validation failed with the following message: 
`env.DATABASE_URL` should be string
```

**Príčina:** Environment variables sa nesmú definovať v `vercel.json` súbore. Musia sa nastaviť cez Vercel Dashboard alebo CLI.

## ✅ Riešenie

Environment variables sa nastavujú **priamo vo Vercel Dashboard**, nie v kóde.

---

## Krok po kroku návod

### 1. Prihláste sa do Vercel

Prejdite na: https://vercel.com

### 2. Otvorte svoj projekt

Kliknite na svoj projekt (racegarage-simulator)

### 3. Otvorte Settings → Environment Variables

1. Kliknite na **Settings** v hornom menu
2. V ľavom menu kliknite na **Environment Variables**

Alebo priamo: `https://vercel.com/[your-username]/[project-name]/settings/environment-variables`

### 4. Pridajte Environment Variables

Pridajte každú premennú osobitne kliknutím na tlačidlo **Add New**.

---

## 📋 Zoznam potrebných premenných

### 1. DATABASE_URL (POVINNÉ)

**Vaša connection string z Neon.tech:**

```
postgresql://neondb_owner:npg_n2zPtwZ8Hrdi@ep-sparkling-bush-aiiotr5s-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

⚠️ **DÔLEŽITÉ:** Odstráňte `&channel_binding=require` z vášho connection stringu!

**Zlý formát (nefunguje):**
```
postgresql://...?sslmode=require&channel_binding=require
```

**Správny formát:**
```
postgresql://...?sslmode=require
```

**Nastavenie vo Vercel:**
- **Name:** `DATABASE_URL`
- **Value:** Vaša connection string (bez channel_binding)
- **Environment:** Production, Preview, Development (zaškrtnite všetky)

### 2. NEXTAUTH_SECRET (POVINNÉ)

Vygenerujte náhodný string pomocou príkazu:

```bash
openssl rand -base64 32
```

Alebo použite online generátor: https://generate-secret.vercel.app/32

**Nastavenie vo Vercel:**
- **Name:** `NEXTAUTH_SECRET`
- **Value:** Vygenerovaný string (napr. `dF3k9mP2xQ7vB8nC5jL1wE4rT6yU0iO9`)
- **Environment:** Production, Preview, Development

### 3. NEXTAUTH_URL (POVINNÉ)

URL vašej aplikácie na Vercel.

**Pre Production:**
```
https://your-app-name.vercel.app
```

Alebo ak máte vlastnú doménu:
```
https://yourdomain.com
```

**Nastavenie vo Vercel:**
- **Name:** `NEXTAUTH_URL`
- **Value:** URL vašej aplikácie
- **Environment:** Production

### 4. EMAIL_FROM (POVINNÉ)

Email adresa odosielateľa notifikácií.

```
noreply@yourdomain.com
```

**Nastavenie vo Vercel:**
- **Name:** `EMAIL_FROM`
- **Value:** Vaša email adresa
- **Environment:** Production, Preview, Development

### 5. EMAIL_PROVIDER (VOLITEĽNÉ)

Ak chcete posielať emaily, nastavte na `resend` alebo `nodemailer`.

```
resend
```

**Nastavenie vo Vercel:**
- **Name:** `EMAIL_PROVIDER`
- **Value:** `resend` (alebo `nodemailer`, alebo nechajte prázdne)
- **Environment:** Production, Preview, Development

### 6. RESEND_API_KEY (VOLITEĽNÉ)

Iba ak používate EMAIL_PROVIDER=resend.

Získajte na: https://resend.com/api-keys

**Nastavenie vo Vercel:**
- **Name:** `RESEND_API_KEY`
- **Value:** Váš Resend API kľúč
- **Environment:** Production, Preview, Development

### 7. SMTP premenné (VOLITEĽNÉ)

Iba ak používate EMAIL_PROVIDER=nodemailer.

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

---

## 🔄 Redeployment po pridaní premenných

Po pridaní všetkých environment variables:

### Možnosť 1: Automatický redeploy (odporúčané)

1. Commitnite a pushnite do GitHub:
   ```bash
   git add .
   git commit -m "Fix vercel.json configuration"
   git push
   ```

2. Vercel automaticky spustí nový deployment

### Možnosť 2: Manuálny redeploy

1. Vo Vercel Dashboard prejdite na záložku **Deployments**
2. Kliknite na tlačidlo **⋮** (tri bodky) pri poslednom deploymete
3. Vyberte **Redeploy**
4. Potvrďte

---

## ✅ Overenie

Po úspešnom deploymente:

1. Otvorte vašu aplikáciu: `https://your-app.vercel.app`
2. Skúste sa prihlásiť
3. Skontrolujte, či funguje databáza

---

## 🔍 Troubleshooting

### Chyba: "DATABASE_URL is not defined"

**Riešenie:** 
- Uistite sa, že ste pridali DATABASE_URL vo Vercel Dashboard
- Zaškrtnite všetky environments (Production, Preview, Development)
- Redeploy aplikáciu

### Chyba: "Can't reach database server"

**Riešenie:**
- Skontrolujte connection string - nemá `&channel_binding=require`
- Uistite sa, že connection string obsahuje `?sslmode=require`
- Overte, že Neon.tech databáza je aktívna

### Chyba: "NEXTAUTH_SECRET is not defined"

**Riešenie:**
- Vygenerujte nový secret: `openssl rand -base64 32`
- Pridajte ho vo Vercel Dashboard
- Redeploy aplikáciu

### Build fails: "Prisma Client could not be generated"

**Riešenie:**
- DATABASE_URL musí byť nastavená aj pre Preview a Development environments
- Alebo použite Vercel Environment Variable pre všetky environments

---

## 📚 Ďalšie zdroje

- [Vercel Environment Variables dokumentácia](https://vercel.com/docs/projects/environment-variables)
- [Neon.tech dokumentácia](https://neon.tech/docs/introduction)
- [NextAuth.js dokumentácia](https://next-auth.js.org/)

---

## ✨ Zhrnutie

✅ **Odstránili sme:** `env` sekciu z `vercel.json`  
✅ **Pridali sme:** Environment variables cez Vercel Dashboard  
✅ **Opravili sme:** Connection string (odstránenie channel_binding)  
✅ **Vytvorili sme:** Tento návod pre budúce použitie

Vaša aplikácia by mala teraz fungovať! 🎉
