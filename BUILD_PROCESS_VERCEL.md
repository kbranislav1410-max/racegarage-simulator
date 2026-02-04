# Proces Buildu na Vercel

## Čo sa Deje Pri Deployi

Keď pushneš kód na GitHub, Vercel automaticky spustí build proces.

## Kroky Buildu

### 1. Klonovanie Repozitára
```
Cloning github.com/kbranislav1410-max/racegarage-simulator
```
- Vercel stiahne tvoj kód z GitHub
- Použije branch, ktorý máš nastavený (napr. `copilot/add-user-roles-superadmin-admin-user`)

### 2. Inštalácia Závislostí
```
Running "install" command: `npm install`
```

Pri inštalácii sa automaticky spustí aj:
```
> racegarage-simulator@0.1.0 postinstall
> prisma generate
```

**Prečo?** V `package.json` máme definovaný `postinstall` hook:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```

Tento hook zabezpečí, že Prisma Client sa vygeneruje automaticky po inštalácii npm balíčkov.

### 3. Build Aplikácie
```
Running "vercel build"
```

Vercel spustí príkaz z `vercel.json`:
```json
{
  "buildCommand": "npm run build"
}
```

Tento príkaz:
1. Kompiluje Next.js aplikáciu
2. Optimalizuje kód pre produkciu
3. Vygeneruje statické súbory a server-side kód

### 4. Deployment
Po úspešnom builde Vercel:
- Nahrá aplikáciu na CDN
- Sprístupní ju na URL
- Nastaví environment premenné

## Prečo sme Odstránili `prisma generate` z buildCommand?

**Predtým:**
```json
{
  "buildCommand": "prisma generate && npm run build"
}
```

**Problém:** Prisma sa generovalo 2x:
1. Pri `npm install` (postinstall hook)
2. Pri build command

**Teraz:**
```json
{
  "buildCommand": "npm run build"
}
```

**Výhoda:** 
- Prisma sa generuje len 1x (pri `npm install`)
- Build je rýchlejší
- Menej redundantných operácií

## Časová Os Buildu

```
┌─────────────────────────────────────────────────────┐
│ 1. Clone Repository                                 │
│    ├─ Download code from GitHub                     │
│    └─ ~300ms                                         │
├─────────────────────────────────────────────────────┤
│ 2. Install Dependencies                             │
│    ├─ npm install                                    │
│    ├─ postinstall: prisma generate ✅                │
│    └─ ~30-60 seconds                                 │
├─────────────────────────────────────────────────────┤
│ 3. Build Application                                │
│    ├─ npm run build                                  │
│    ├─ Compile Next.js                                │
│    ├─ Optimize assets                                │
│    └─ ~60-90 seconds                                 │
├─────────────────────────────────────────────────────┤
│ 4. Deploy                                           │
│    ├─ Upload to Vercel CDN                          │
│    ├─ Configure routing                             │
│    └─ ~10-20 seconds                                 │
└─────────────────────────────────────────────────────┘

Total: ~2-3 minutes
```

## Typické Build Výstupy

### ✅ Úspešný Build

```
✔ Generated Prisma Client (v7.2.0)
✔ Compiled successfully
✔ Linting and checking validity of types
✔ Creating an optimized production build
✔ Deployment complete
```

### ❌ Chybný Build

**Prisma chyby:**
```
Error: P1001: Can't reach database server
```
→ Skontroluj DATABASE_URL v environment variables

**Next.js build chyby:**
```
Error: Module not found
```
→ Skontroluj, či sú všetky dependencies v package.json

**TypeScript chyby:**
```
Type error: Property 'xxx' does not exist
```
→ Oprav TypeScript chyby v kóde

## Ako Sledovať Build

### 1. V Vercel Dashboard
- Otvor https://vercel.com
- Vyber svoj projekt
- Klikni na "Deployments"
- Uvidíš live build log

### 2. Príkazový Riadok (GitHub Push)
```bash
git push origin copilot/add-user-roles-superadmin-admin-user
```
- Vercel automaticky zachytí push
- Build začne do 10 sekúnd

### 3. Manuálny Redeploy
- Vercel Dashboard → Deployments
- Klikni na "Redeploy" button
- Build začne okamžite

## Optimalizácia Build Času

### Naše Optimalizácie:
1. ✅ Odstránili sme redundantné `prisma generate`
2. ✅ Používame `postinstall` hook
3. ✅ Next.js cache sa použije, keď je možné

### Ďalšie Možnosti:
- **Incremental Static Regeneration (ISR)** - pre statické stránky
- **Edge Functions** - pre rýchlejšie API routes
- **Image Optimization** - automaticky optimalizuje obrázky

## Environment Variables na Vercel

Build potrebuje tieto premenné (nastavené v Vercel Dashboard):

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://tvoja-aplikacia.vercel.app
EMAIL_FROM=noreply@tvoja-domena.com
RESEND_API_KEY=xxx  # voliteľné
```

**Dôležité:** Environment variables musia byť nastavené **pred** buildom!

## Troubleshooting

### Build Zlyhá na Prisma Generate
**Príčina:** DATABASE_URL nie je nastavená alebo je nesprávna

**Riešenie:**
1. Vercel Dashboard → Settings → Environment Variables
2. Pridaj DATABASE_URL
3. Redeploy

### Build Zlyhá na TypeScript Errors
**Príčina:** Syntaxové alebo typové chyby v kóde

**Riešenie:**
1. Spusti lokálne: `npm run build`
2. Oprav všetky chyby
3. Push opravy na GitHub

### Build Trvá Príliš Dlho
**Normálne trvanie:** 2-3 minúty

**Ak trvá viac:**
- Skontroluj, či nemáš veľké dependencies
- Skontroluj, či build log neukazuje warnings
- Cache môže byť invalidovaná

## Úspešný Deploy

Po úspešnom builde uvidíš:
```
✓ Deployment Complete
Preview: https://racegarage-simulator-xxx.vercel.app
Production: https://tvoja-aplikacia.vercel.app (ak je to production branch)
```

## Ďalšie Kroky Po Prvom Deployе

1. **Otestuj aplikáciu** na Vercel URL
2. **Spusti seed script** (ak potrebuješ dáta):
   - Nemôžeš spustiť priamo na Vercel
   - Musíš použiť database dashboard alebo lokálne sa pripojiť
3. **Pripoj vlastnú doménu** (websupport.sk)
4. **Nastav production environment variables**

## Užitočné Linky

- **Vercel Build Dokumentácia:** https://vercel.com/docs/deployments/builds
- **Next.js Build Output:** https://nextjs.org/docs/deployment
- **Prisma v Serverless:** https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel

---

**Poznámka:** Tento dokument popisuje build proces po našich optimalizáciách. Aplikácia by sa mala úspešne buildiť a deployovať na Vercel.
