# 🔧 RIEŠENIE PROBLÉMOV PRI NASADENÍ

## Kompletný Troubleshooting Guide

---

## 🔴 Build Errors

### Chyba: "Prisma Client Not Generated"

**Symptóm:**
```
Error: @prisma/client did not initialize yet
```

**Riešenie:**
1. Overte že `package.json` má `postinstall` script:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

2. Vercel: Redeploy projekt
3. VPS: Spustite `npm run db:generate`

---

### Chyba: "Module not found"

**Symptóm:**
```
Module not found: Can't resolve '@/...'
```

**Riešenie:**
1. Skontrolujte `tsconfig.json` má správne paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

2. Vyčistite a rebuild:
```bash
rm -rf .next node_modules
npm install
npm run build
```

---

### Chyba: "Build exceeded maximum duration"

**Symptóm:** Build trvá príliš dlho a zlyhá

**Riešenie Vercel:**
1. Skontrolujte či máte Free tier (10min limit)
2. Upgrade na Pro plan (45min limit)
3. Alebo optimalizujte build

---

## 🔴 Database Errors

### Chyba: "Can't reach database server"

**Symptóm:**
```
Error: P1001: Can't reach database server at `host`
```

**Riešenie:**

1. **Overte DATABASE_URL:**
```bash
# Správny formát:
postgresql://user:password@host:port/database?schema=public

# Skontrolujte:
# - Username správny?
# - Password správne?
# - Host správny?
# - Port správny? (obvykle 5432)
# - Database existuje?
```

2. **Whitelist IP adresy:**
- Neon.tech: Automaticky povolené
- Supabase: Povoľte všetky IP (0.0.0.0/0)
- VPS: Skontrolujte PostgreSQL pg_hba.conf

3. **Test pripojenia:**
```bash
# Lokálne test
psql "postgresql://user:pass@host:5432/db"

# Alebo použite pgAdmin / TablePlus
```

---

### Chyba: "SSL connection required"

**Symptóm:**
```
Error: SSL connection is required
```

**Riešenie:**
Pridajte `?sslmode=require` do DATABASE_URL:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

---

### Chyba: "Table does not exist"

**Symptóm:**
```
Error: Table 'users' does not exist
```

**Riešenie:**
1. Spustite migráciu:
```bash
npx prisma db push
```

2. Alebo vytvorte migráciu:
```bash
npx prisma migrate deploy
```

---

## 🔴 Environment Variables

### Chyba: "Missing DATABASE_URL"

**Vercel:**
1. Settings → Environment Variables
2. Pridajte `DATABASE_URL`
3. Vyberte **Production** environment
4. Save
5. Redeploy

**VPS:**
1. Skontrolujte `.env` súbor existuje
2. Overte že obsahuje `DATABASE_URL`
3. Reštartujte aplikáciu: `pm2 restart racegarage`

---

### Chyba: Environment Variables sa Nemenia

**Riešenie Vercel:**
1. Zmeňte hodnotu
2. **Musíte Redeploy!**
3. Deployments → Latest → "Redeploy"

**Riešenie VPS:**
1. Zmeňte `.env`
2. **Musíte Reštartovať!**
3. `pm2 restart racegarage`

---

## 🔴 Domain Issues

### Doména Nefunguje (404 / Not Found)

**Riešenie:**

1. **Overte DNS záznamy:**
```bash
# Linux/Mac
dig vasadomena.sk
nslookup vasadomena.sk

# Windows
nslookup vasadomena.sk
```

2. **Overte propagáciu:**
https://dnschecker.org

3. **Vercel DNS:**
```
@    A     76.76.21.21
www  CNAME cname.vercel-dns.com
```

4. **VPS DNS:**
```
@    A     VASA_VPS_IP
www  A     VASA_VPS_IP
```

5. **Počkajte:** DNS propagácia môže trvať 15-60 minút (niekedy až 48h)

---

### SSL Certificate Error

**Symptóm:** "Your connection is not private"

**Riešenie Vercel:**
- Automaticky by malo fungovať
- Ak nie, Settings → Domains → Force HTTPS

**Riešenie VPS:**
```bash
# Znovu spustite certbot
certbot --nginx -d vasadomena.sk -d www.vasadomena.sk

# Alebo renewujte
certbot renew

# Reštartujte nginx
systemctl restart nginx
```

---

## 🔴 Application Errors

### 500 Internal Server Error

**Riešenie:**

1. **Skontrolujte logy:**

**Vercel:**
- Dashboard → Project → Logs
- Runtime Logs

**VPS:**
```bash
pm2 logs racegarage
```

2. **Časté príčiny:**
- Chybajúce environment variables
- Databázové pripojenie zlyhalo
- Chyba v kóde

---

### Login Nefunguje (401 Unauthorized)

**Riešenie:**

1. **Overte že seed bol spustený:**
```bash
npm run db:seed
```

2. **Skontrolujte používateľov v databáze:**
```bash
npx prisma studio
# Otvorte Users tabuľku
# Mali by tam byť 3 používatelia
```

3. **Použite správne heslá:**
- `superadmin@local.test` / `superadmin123!`
- `admin@local.test` / `admin123!`
- `user@local.test` / `user123!`

---

### Stránka sa Načítava Pomaly

**Riešenie:**

1. **Optimalizujte obrázky:**
- Použite Next.js Image component
- Komprimujte obrázky

2. **Vercel:**
- Free tier má obmedzenia
- Zvážte upgrade na Pro

3. **VPS:**
- Zvýšte server resources
- Pridajte Redis cache
- Použite CDN

---

## 🔴 Email Issues

### Emaily sa Neposielajú

**Riešenie:**

1. **Skontrolujte EMAIL_PROVIDER:**
```bash
# Ak je prázdne, emaily sa neposielajú (to je OK)
EMAIL_PROVIDER=""

# Alebo nastavte
EMAIL_PROVIDER="resend"
# alebo
EMAIL_PROVIDER="nodemailer"
```

2. **Resend:**
- Overte API kľúč
- Skontrolujte limit (100/deň free tier)

3. **SMTP:**
- Overte SMTP credentials
- Test pripojenia

---

## 🔴 VPS Specific Issues

### PM2 Application Crashed

**Riešenie:**
```bash
# Zistite status
pm2 status

# Pozrite logy
pm2 logs racegarage --lines 50

# Reštartujte
pm2 restart racegarage

# Ak to nepomôže, rebuild
cd /home/racegarage/racegarage-simulator
npm run build
pm2 restart racegarage
```

---

### Nginx 502 Bad Gateway

**Riešenie:**
```bash
# Skontrolujte PM2 beží
pm2 status

# Skontrolujte Nginx config
nginx -t

# Pozrite Nginx logy
tail -f /var/log/nginx/error.log

# Reštartujte Nginx
systemctl restart nginx
```

---

### Port Already in Use

**Symptóm:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Riešenie:**
```bash
# Nájdite proces
lsof -i :3000

# Zabite proces
kill -9 PID

# Alebo použite iný port
# V .env pridajte:
PORT=3001
```

---

## 🔴 Vercel Specific Issues

### Deployment Failed

**Riešenie:**

1. **Skontrolujte build logy**
2. **Časté príčiny:**
   - TypeScript errors
   - ESLint errors
   - Missing dependencies

3. **Quick fix:**
```bash
# Lokálne otestujte build
npm run build

# Ak funguje lokálne, issue je v Vercel env variables
```

---

### Function Execution Timeout

**Symptóm:** API routes timeout po 10 sekundách

**Riešenie:**
- Free tier: 10s limit
- Pro tier: 60s limit
- Optimalizujte databázové queries
- Používajte connection pooling

---

## 📊 Diagnostické Nástroje

### Lokálne Testovanie Produkcie

```bash
# 1. Build produkčný
npm run build

# 2. Spustite produkčný server
npm start

# 3. Otvorte
http://localhost:3000

# 4. Testujte všetko
```

---

### Database Connection Test

```bash
# Použite psql
psql "postgresql://user:pass@host:5432/db"

# Alebo Node.js
node -e "
const { Client } = require('pg');
const client = new Client({ connectionString: 'YOUR_DB_URL' });
client.connect().then(() => {
  console.log('✅ Connected!');
  client.end();
}).catch(e => console.error('❌ Error:', e));
"
```

---

### Vercel Logs

```bash
# Nainštalujte Vercel CLI
npm i -g vercel

# Prihláste sa
vercel login

# Pozrite logy
vercel logs
```

---

## 🆘 Ďalšia Pomoc

### Kde Hľadať Pomoc:

1. **Dokumentácia:**
   - [DEPLOYMENT_WEBSUPPORT.md](./DEPLOYMENT_WEBSUPPORT.md)
   - [RYCHLE_NASADENIE.md](./RYCHLE_NASADENIE.md)

2. **Oficiálne Docs:**
   - Vercel: https://vercel.com/docs
   - Next.js: https://nextjs.org/docs
   - Prisma: https://www.prisma.io/docs

3. **Support:**
   - Websupport: podpora@websupport.sk
   - Vercel Discord: https://vercel.com/discord

---

## ✅ Kontrolný Zoznam Pre Debug

Keď niečo nefunguje, prejdite:

- [ ] Build úspešný?
- [ ] Environment variables nastavené?
- [ ] DATABASE_URL správna?
- [ ] Databáza beží a je dostupná?
- [ ] Prisma generate spustené?
- [ ] Databázové tabuľky vytvorené?
- [ ] Seed spustený?
- [ ] DNS správne nastavené?
- [ ] SSL certifikát aktívny?
- [ ] Aplikácia beží? (PM2/Vercel)
- [ ] Logy skontrolované?

---

**Tip:** Väčšina problémov je spôsobená:
1. Chybajúce environment variables
2. Nesprávna DATABASE_URL
3. Nezvolená Prisma migrácia

Vždy začnite kontrolou týchto troch vecí! 🎯
