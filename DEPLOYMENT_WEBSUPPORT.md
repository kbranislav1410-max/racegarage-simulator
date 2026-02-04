# 🚀 NASADENIE APLIKÁCIE NA WEBSUPPORT.SK

## Kompletný Návod Krok po Kroku

Tento návod vás prevedie celým procesom nasadenia Racegarage Simulator aplikácie na váš websupport.sk hosting.

---

## 📋 Obsah

1. [Príprava a Požiadavky](#1-príprava-a-požiadavky)
2. [Možnosti Nasadenia](#2-možnosti-nasadenia)
3. [Odporúčané Riešenie: Vercel (Jednoduchšie)](#3-odporúčané-riešenie-vercel)
4. [Alternatíva: VPS Hosting na Websupport](#4-alternatíva-vps-hosting-na-websupport)
5. [Nastavenie Domény](#5-nastavenie-domény)
6. [Databáza PostgreSQL](#6-databáza-postgresql)
7. [Konfigurácia Prostredia](#7-konfigurácia-prostredia)
8. [Build a Deploy](#8-build-a-deploy)
9. [Riešenie Problémov](#9-riešenie-problémov)

---

## 1. Príprava a Požiadavky

### ⚠️ DÔLEŽITÉ: Typ Aplikácie

Vaša aplikácia je **Next.js 16** aplikácia s **Server-Side Rendering (SSR)**, čo znamená:
- ❌ **NEMÔŽE** fungovať na klasickom zdieľanom webhostingu (PHP hosting)
- ✅ **POTREBUJE** Node.js server prostredie
- ✅ **POTREBUJE** PostgreSQL databázu
- ✅ **POTREBUJE** bežať na porte 3000 alebo inom

### Čo Potrebujete:

✅ **Hotové na Vašej Strane:**
- [ ] Doména na websupport.sk
- [ ] Hosting účet na websupport.sk
- [ ] Prístupové údaje do websupport.sk

✅ **Potrebné Pre Aplikáciu:**
- [ ] PostgreSQL databáza (online)
- [ ] Node.js hosting prostredie
- [ ] Git repozitár (máte na GitHub)
- [ ] Emailový server (voliteľné)

---

## 2. Možnosti Nasadenia

### Varianta A: Vercel (ODPORÚČANÉ - Jednoduchšie) ⭐

**Výhody:**
- ✅ Špeciálne navrhnuté pre Next.js
- ✅ Automatické nasadenie pri git push
- ✅ HTTPS zadarmo
- ✅ Globálna CDN
- ✅ Jednoduché nastavenie
- ✅ Zadarmo pre jeden projekt

**Nevýhody:**
- ⚠️ Potrebujete externú PostgreSQL databázu
- ⚠️ Doména bude smerovať na Vercel (nie priamo na websupport)

### Varianta B: Websupport VPS

**Výhody:**
- ✅ Plná kontrola
- ✅ Všetko na jednom mieste

**Nevýhody:**
- ❌ Potrebujete VPS (nie klasický webhosting)
- ❌ Technicky náročnejšie
- ❌ Manuálne nastavenie

### Varianta C: iný Cloud Provider (Railway, Render, DigitalOcean)

Podobné ako Vercel, ale s rôznymi funkciami.

---

## 3. Odporúčané Riešenie: Vercel

### Prečo Vercel?

Vercel je vytvorený tímom Next.js, takže je **ideálny** pre vašu aplikáciu.

### Krok 1: Vytvorenie Vercel Účtu

1. Otvorte: https://vercel.com
2. Kliknite na **"Sign Up"**
3. Prihláste sa pomocou **GitHub účtu**
4. Autorizujte Vercel prístup k vášmu GitHub repozitáru

### Krok 2: Import Projektu

1. Na Vercel dashboard kliknite **"Add New Project"**
2. Vyberte váš repozitár: `kbranislav1410-max/racegarage-simulator`
3. Vyberte branch: `copilot/add-user-roles-superadmin-admin-user` (alebo `main`)
4. Kliknite **"Import"**

### Krok 3: Konfigurácia Projektu

**Framework Preset:** Next.js (automaticky detegované)

**Build Settings:**
```
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

**Root Directory:** `./` (ponechajte prázdne)

### Krok 4: Nastavenie Environment Variables

V Vercel, v sekcii **"Environment Variables"**, pridajte:

```bash
# PostgreSQL Database (POVINNÉ)
DATABASE_URL=postgresql://user:password@host:5432/database

# Email (VOLITEĽNÉ - môžete nechať prázdne)
EMAIL_PROVIDER=
EMAIL_FROM=noreply@vasadomena.sk

# Ak použijete Resend pre emaily
RESEND_API_KEY=

# Ak použijete SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

⚠️ **DÔLEŽITÉ:** `DATABASE_URL` musí byť vyplnený! Pozrite časť [6. Databáza PostgreSQL](#6-databáza-postgresql).

### Krok 5: Deploy

1. Kliknite **"Deploy"**
2. Počkajte 2-5 minút
3. Vercel automaticky:
   - Nainštaluje závislosti
   - Spustí Prisma generate
   - Zbuilduje aplikáciu
   - Nasadí na produkciu

### Krok 6: Získanie URL

Po úspešnom nasadení dostanete URL ako:
```
https://racegarage-simulator.vercel.app
```

### Krok 7: Pripojenie Domény z Websupport

1. V Vercel, choďte na **Settings → Domains**
2. Pridajte vašu doménu: `vasadomena.sk`
3. Vercel vám zobrazí DNS záznamy, ktoré musíte pridať

**V Websupport admin paneli:**

1. Prihláste sa na https://admin.websupport.sk
2. Choďte na **Domény → Vaša doména → DNS záznamy**
3. Pridajte záznamy podľa Vercel inštrukcií:

**Typ A záznam:**
```
@    A    76.76.21.21
```

**Typ CNAME záznam:**
```
www  CNAME  cname.vercel-dns.com
```

4. Uložte zmeny
5. Počkajte 15-60 minút na propagáciu DNS

### Krok 8: Inicializácia Databázy

**Po prvom nasadení musíte:**

1. Otvorte Vercel Console alebo použite lokálny príkaz:

```bash
# Nastavte DATABASE_URL na produkčnú databázu
DATABASE_URL="your_production_db_url" npx prisma db push

# Vytvorte používateľov
DATABASE_URL="your_production_db_url" npm run db:seed
```

2. Alebo použite Vercel CLI:

```bash
# Nainštalujte Vercel CLI
npm i -g vercel

# Prihláste sa
vercel login

# Push databázy
vercel env pull
npx prisma db push
npm run db:seed
```

### ✅ Hotovo!

Vaša aplikácia je teraz live na:
- `https://vasadomena.sk`
- `https://www.vasadomena.sk`

---

## 4. Alternatíva: VPS Hosting na Websupport

### Krok 1: Objednanie VPS

1. Prihláste sa na https://www.websupport.sk
2. Objednajte **VPS server**
3. Odporúčané minimum:
   - 2 CPU jadrá
   - 2 GB RAM
   - 50 GB SSD
   - Ubuntu 22.04 LTS

### Krok 2: Pripojenie na VPS

```bash
ssh root@vasa-vps-ip-adresa
```

### Krok 3: Inštalácia Node.js a PostgreSQL

```bash
# Aktualizácia systému
apt update && apt upgrade -y

# Inštalácia Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Overte verziu
node --version  # mali by ste vidieť v20.x.x
npm --version

# Inštalácia PostgreSQL
apt install -y postgresql postgresql-contrib

# Inštalácia PM2 (process manager)
npm install -g pm2

# Inštalácia Nginx (reverse proxy)
apt install -y nginx

# Inštalácia certbot (pre SSL)
apt install -y certbot python3-certbot-nginx
```

### Krok 4: Nastavenie PostgreSQL

```bash
# Prepnúť na postgres používateľa
sudo -u postgres psql

# V PostgreSQL konzole:
CREATE DATABASE racegarage;
CREATE USER racegarage_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE racegarage TO racegarage_user;
\q
```

### Krok 5: Naklonovanie Projektu

```bash
# Vytvorte používateľa pre aplikáciu
adduser --disabled-password --gecos "" racegarage
su - racegarage

# Klonujte repozitár
git clone https://github.com/kbranislav1410-max/racegarage-simulator.git
cd racegarage-simulator

# Checkout správnej vetvy
git checkout copilot/add-user-roles-superadmin-admin-user
```

### Krok 6: Konfigurácia

```bash
# Vytvorte .env súbor
nano .env
```

Vložte:
```bash
DATABASE_URL="postgresql://racegarage_user:strong_password_here@localhost:5432/racegarage?schema=public"
EMAIL_PROVIDER=""
EMAIL_FROM="noreply@vasadomena.sk"
```

Uložte: `Ctrl+X`, `Y`, `Enter`

### Krok 7: Inštalácia a Build

```bash
# Inštalácia závislostí
npm install

# Generovanie Prisma klienta
npm run db:generate

# Vytvorenie databázových tabuliek
npm run db:push

# Vytvorenie používateľov
npm run db:seed

# Build aplikácie
npm run build
```

### Krok 8: Spustenie s PM2

```bash
# Spustite aplikáciu
pm2 start npm --name "racegarage" -- start

# Nastavte automatický štart
pm2 startup
pm2 save

# Overte že beží
pm2 status
pm2 logs racegarage
```

### Krok 9: Nastavenie Nginx

```bash
# Vráťte sa na root používateľa
exit

# Vytvorte Nginx konfiguráciu
nano /etc/nginx/sites-available/racegarage
```

Vložte:
```nginx
server {
    listen 80;
    server_name vasadomena.sk www.vasadomena.sk;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Aktivujte konfiguráciu
ln -s /etc/nginx/sites-available/racegarage /etc/nginx/sites-enabled/

# Testujte konfiguráciu
nginx -t

# Reštartujte Nginx
systemctl restart nginx
```

### Krok 10: SSL Certifikát (HTTPS)

```bash
# Získajte Let's Encrypt certifikát
certbot --nginx -d vasadomena.sk -d www.vasadomena.sk

# Postupujte podľa inštrukcií:
# 1. Zadajte email
# 2. Súhlaste s podmienkami
# 3. Vyberte "Redirect" pre HTTPS
```

### Krok 11: DNS Nastavenie na Websupport

1. Prihláste sa na https://admin.websupport.sk
2. Choďte na **Domény → Vaša doména → DNS záznamy**
3. Pridajte A záznam:

```
@    A    VASA_VPS_IP_ADRESA
www  A    VASA_VPS_IP_ADRESA
```

4. Uložte a počkajte 15-60 minút

### ✅ Hotovo!

Aplikácia beží na `https://vasadomena.sk`

---

## 5. Nastavenie Domény

### Ak používate Vercel:

Postupujte podľa [Krok 7 v sekcii Vercel](#krok-7-pripojenie-domény-z-websupport).

### Ak používate VPS:

Postupujte podľa [Krok 11 v sekcii VPS](#krok-11-dns-nastavenie-na-websupport).

---

## 6. Databáza PostgreSQL

### Možnosti pre Databázu:

#### Možnosť A: Websupport Databáza (ak je dostupná)

Skontrolujte či websupport ponúka PostgreSQL databázu v rámci vášho účtu.

#### Možnosť B: Neon.tech (Zadarmo, Odporúčané)

1. Otvorte: https://neon.tech
2. Zaregistrujte sa (GitHub login)
3. Vytvorte nový projekt: "racegarage"
4. Vyberte región: **Frankfurt** (najbližší k SK)
5. Skopírujte **Connection String**

Príklad:
```
postgresql://user:password@ep-xyz.eu-central-1.aws.neon.tech/racegarage
```

#### Možnosť C: ElephantSQL (Zadarmo)

1. Otvorte: https://www.elephantsql.com
2. Vytvorte účet
3. Vytvorte novú inštanciu (Free tier - Tiny Turtle)
4. Skopírujte URL

#### Možnosť D: Supabase (Zadarmo)

1. Otvorte: https://supabase.com
2. Vytvorte projekt
3. V Settings → Database získajte Connection String
4. Použite **Connection pooling** URL pre produkciu

---

## 7. Konfigurácia Prostredia

### Environment Variables (.env)

**Pre Produkciu:**

```bash
# === POVINNÉ ===
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"

# === EMAIL (VOLITEĽNÉ) ===
# Nechajte prázdne ak nechcete emaily
EMAIL_PROVIDER=""
EMAIL_FROM="noreply@vasadomena.sk"

# Resend (jednoduchý, odporúčané)
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_..."

# Alebo SMTP (websupport email)
EMAIL_PROVIDER="nodemailer"
SMTP_HOST="smtp.websupport.sk"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="vasemail@vasadomena.sk"
SMTP_PASS="heslo"
```

### Ako Nastaviť na Vercel:

1. V Vercel projekte → **Settings → Environment Variables**
2. Pridajte každú premennú osobitne
3. Vyberte **Production** environment
4. Kliknite **Save**
5. Redeploy projekt

### Ako Nastaviť na VPS:

Upravte `/home/racegarage/racegarage-simulator/.env` súbor.

---

## 8. Build a Deploy

### Vercel (Automatické)

```bash
# Lokálne:
git add .
git commit -m "Production changes"
git push origin your-branch

# Vercel automaticky:
# 1. Deteguje zmeny
# 2. Spustí build
# 3. Nasadí novu verziu
```

### VPS (Manuálne)

```bash
# SSH na VPS
ssh root@vasa-vps-ip

# Prepnite na app používateľa
su - racegarage
cd racegarage-simulator

# Pull najnovšie zmeny
git pull origin your-branch

# Inštalujte nové závislosti (ak sú)
npm install

# Rebuild
npm run build

# Reštartujte aplikáciu
exit  # späť na root
pm2 restart racegarage
```

---

## 9. Riešenie Problémov

### Build Fails na Vercel

**Chyba:** `Prisma Client Not Generated`

**Riešenie:**
Pridajte do `package.json`:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

### Database Connection Error

**Chyba:** `Can't reach database server`

**Riešenie:**
1. Overte `DATABASE_URL` v environment variables
2. Skontrolujte či databáza beží
3. Overte firewall pravidlá (povoľte pripojenia)

### 502 Bad Gateway (VPS)

**Riešenie:**
```bash
# Skontrolujte PM2
pm2 status
pm2 logs racegarage

# Reštartujte aplikáciu
pm2 restart racegarage

# Skontrolujte Nginx
systemctl status nginx
nginx -t
```

### Aplikácia sa Nezobrazuje

**Riešenie:**
1. Overte DNS záznamy (môže trvať až 48h)
2. Vyčistite cache prehliadača
3. Skúste incognito režim
4. Overte na https://dnschecker.org

### Logo/Pozadie sa Nezobrazuje

**Riešenie:**
```bash
# Pridajte logo.png do public/
# Commitnite zmenu (alebo pridajte manuálne na server)
```

---

## 📞 Ďalšia Pomoc

### Websupport Support

- **Web:** https://www.websupport.sk/podpora
- **Email:** podpora@websupport.sk
- **Telefón:** +421 2 / 58 10 76 50

### Dokumentácie

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## ✅ Kontrolný Zoznam

### Pred Nasadením:
- [ ] Mám GitHub repozitár
- [ ] Mám doménu na websupport.sk
- [ ] Rozhodol som sa pre hosting riešenie (Vercel/VPS)
- [ ] Mám PostgreSQL databázu (alebo plán kde ju získam)

### Pre Vercel Nasadenie:
- [ ] Vytvorený Vercel účet
- [ ] Projekt importovaný z GitHub
- [ ] Environment variables nastavené
- [ ] Databáza pripojená
- [ ] Deploy úspešný
- [ ] Doména pripojená
- [ ] DNS záznamy aktualizované
- [ ] Databázové tabuľky vytvorené (prisma push)
- [ ] Používatelia vytvorení (seed)
- [ ] Aplikácia funguje na doméne

### Pre VPS Nasadenie:
- [ ] VPS objednaný a prístupný
- [ ] Node.js nainštalovaný
- [ ] PostgreSQL nainštalovaný
- [ ] Databáza vytvorená
- [ ] Projekt naklonovaný
- [ ] Závislosti nainštalované
- [ ] Build úspešný
- [ ] PM2 spustené
- [ ] Nginx nakonfigurovaný
- [ ] SSL certifikát získaný
- [ ] DNS smeruje na VPS
- [ ] Aplikácia funguje

---

## 🎉 Záver

**Odporúčanie:** Pre jednoduchšie nasadenie začnite s **Vercel + Neon.tech databázou**. Je to najjednoduchšie a najrýchlejšie riešenie, špeciálne navrhnuté pre Next.js aplikácie.

**Pre pokročilých:** VPS dáva plnú kontrolu, ale vyžaduje viac technických znalostí.

Ak budete potrebovať pomoc s konkrétnym krokom, dajte vedieť! 🚀
