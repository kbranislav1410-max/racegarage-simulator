# ✅ KONTROLNÝ ZOZNAM NASADENIA

## Pred Nasadením

### Lokálna Príprava
- [ ] Aplikácia funguje lokálne (`npm run dev`)
- [ ] Build úspešný (`npm run build`)
- [ ] Produkčný server funguje (`npm start`)
- [ ] Všetky testy prejdú (ak existujú)
- [ ] Logo pridané do `public/logo.png`
- [ ] Pozadie pridané do `public/login-bg.jpg` (ak chcete)

### Git a GitHub
- [ ] Kód commitnutý do Git
- [ ] Pushnutý na GitHub
- [ ] Vetva je aktuálna

---

## Vercel Nasadenie

### Príprava
- [ ] GitHub repozitár je verejný alebo máte prístup
- [ ] Vytvorený Vercel účet
- [ ] PostgreSQL databáza pripravená (Neon/Supabase/iná)

### Import a Konfigurácia
- [ ] Projekt importovaný z GitHub
- [ ] Framework detegovaný ako Next.js
- [ ] Build settings správne:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### Environment Variables
- [ ] `DATABASE_URL` nastavená
- [ ] `EMAIL_PROVIDER` nastavený (alebo prázdny)
- [ ] `EMAIL_FROM` nastavený
- [ ] Ďalšie email premenné (ak používate)
- [ ] Environment: **Production** vybrané
- [ ] Uložené

### Deploy
- [ ] Prvý deploy spustený
- [ ] Build úspešný (zelený ✓)
- [ ] Preview URL funguje
- [ ] Žiadne build errory

### Databáza
- [ ] `npx prisma db push` spustené
- [ ] `npm run db:seed` spustené
- [ ] Používatelia vytvorení
- [ ] Prihlásenie funguje

### Doména
- [ ] Doména pridaná vo Vercel
- [ ] DNS záznamy pridané na websupport.sk:
  - [ ] A záznam: `@ → 76.76.21.21`
  - [ ] CNAME záznam: `www → cname.vercel-dns.com`
- [ ] DNS propagované (15-60 min)
- [ ] HTTPS funguje
- [ ] Doména funguje

---

## VPS Nasadenie

### VPS Príprava
- [ ] VPS objednaný
- [ ] SSH prístup funguje
- [ ] Ubuntu/Debian nainštalované

### Softvér
- [ ] Node.js 20+ nainštalovaný
- [ ] PostgreSQL nainštalovaný
- [ ] PM2 nainštalovaný
- [ ] Nginx nainštalovaný
- [ ] Certbot nainštalovaný
- [ ] Git nainštalovaný

### Databáza
- [ ] PostgreSQL beží
- [ ] Databáza vytvorená
- [ ] Používateľ vytvorený
- [ ] Oprávnenia nastavené
- [ ] Test pripojenia úspešný

### Aplikácia
- [ ] Používateľ vytvorený (`racegarage`)
- [ ] Repozitár naklonovaný
- [ ] Správna vetva checkoutnutá
- [ ] `.env` súbor vytvorený a vyplnený
- [ ] `npm install` úspešný
- [ ] `npx prisma generate` úspešný
- [ ] `npx prisma db push` úspešný
- [ ] `npm run db:seed` úspešný
- [ ] `npm run build` úspešný

### PM2
- [ ] Aplikácia spustená s PM2
- [ ] PM2 startup nastavený
- [ ] PM2 save vykonané
- [ ] `pm2 status` ukazuje app running
- [ ] `pm2 logs` bez errorov

### Nginx
- [ ] Config súbor vytvorený
- [ ] Symlink vytvorený
- [ ] `nginx -t` úspešný
- [ ] Nginx reštartovaný
- [ ] Port 80 funguje

### SSL
- [ ] Certbot spustený
- [ ] Certifikát získaný
- [ ] HTTPS funguje
- [ ] HTTP redirect na HTTPS

### DNS
- [ ] A záznam pridaný (doména → VPS IP)
- [ ] A záznam pridaný (www → VPS IP)
- [ ] DNS propagované
- [ ] Doména funguje

---

## Po Nasadení

### Testovanie
- [ ] Prihlasovacia stránka funguje
- [ ] Super admin login funguje
- [ ] Admin login funguje
- [ ] User login funguje
- [ ] Dashboard sa načíta
- [ ] Sidebar funguje
- [ ] Logo sa zobrazuje
- [ ] Všetky stránky fungujú:
  - [ ] Prehľad (Dashboard)
  - [ ] Zákazníci
  - [ ] Jazdy
  - [ ] Rezervácie
  - [ ] Platby
  - [ ] Vyúčtovania
  - [ ] Poukazy
  - [ ] Nastavenia
- [ ] CRUD operácie fungujú:
  - [ ] Create (vytvorenie)
  - [ ] Read (zobrazenie)
  - [ ] Update (upravenie)
  - [ ] Delete (mazanie - len pre admina)
- [ ] Filtre fungujú
- [ ] Export funguje
- [ ] Emaily fungujú (ak nastavené)

### Bezpečnosť
- [ ] HTTPS funguje (zelený zámok)
- [ ] Database credentials silné
- [ ] `.env` súbor nie je commitnutý
- [ ] Production environment variables bezpečne uložené
- [ ] Firewall nastavený (VPS)
- [ ] SSH key authentication (VPS)
- [ ] Fail2ban nainštalovaný (VPS, odporúčané)

### Performance
- [ ] Stránky sa načítavajú rýchlo (< 3s)
- [ ] Obrázky optimalizované
- [ ] Logo správna veľkosť
- [ ] Žiadne 404 errory v konzole
- [ ] Žiadne JavaScript errory

### Monitoring
- [ ] Vercel Analytics zapnuté (ak Vercel)
- [ ] Error tracking nastavený (voliteľné)
- [ ] Uptime monitoring (voliteľné)
- [ ] PM2 monitoring (ak VPS)

---

## Dokumentácia

### Pre Používateľov
- [ ] Prihlasovacie údaje zdieľané
- [ ] Návod na používanie (ak potrebné)
- [ ] Kontaktné info pre support

### Pre Vývojárov
- [ ] README.md aktualizovaný
- [ ] Production URL zadokumentovaný
- [ ] Environment variables zadokumentované
- [ ] Deployment proces zadokumentovaný

---

## Backup a Údržba

### Backup
- [ ] Automatický database backup nastavený
- [ ] Test obnovy z backupu
- [ ] Backup retention policy definovaný

### Monitoring
- [ ] Disk space monitoring
- [ ] Database size monitoring
- [ ] Uptime monitoring
- [ ] Error rate monitoring

### Aktualizácie
- [ ] Plán pre code updates
- [ ] Plán pre dependency updates
- [ ] Plán pre security patches

---

## Kontaktné Informácie

### Prístupy (Bezpečne Uložené)
- [ ] Vercel login
- [ ] GitHub access
- [ ] Database credentials
- [ ] VPS SSH key (ak VPS)
- [ ] Domain registrar login
- [ ] Email provider API keys

### Dôležité URL
- [ ] Production URL: `___________________`
- [ ] Vercel Dashboard: `___________________`
- [ ] Database Admin: `___________________`
- [ ] GitHub Repo: `___________________`

---

## Hotovo! 🎉

Po dokončení tohto checklistu:
- ✅ Aplikácia je live
- ✅ Všetko funguje
- ✅ Bezpečné
- ✅ Dokumentované
- ✅ Monitorované

**Gratulujeme k úspešnému nasadeniu!** 🚀

---

## Poznámky

Dátum nasadenia: `___________________`

Použité služby:
- [ ] Vercel
- [ ] VPS (ktorý? `___________________`)
- [ ] Databáza (ktorá? `___________________`)
- [ ] Email (ktorý? `___________________`)

Problémy počas nasadenia:
```
_______________________________________________
_______________________________________________
_______________________________________________
```

Riešenia:
```
_______________________________________________
_______________________________________________
_______________________________________________
```

---

**Tip:** Vytlačte alebo uložte tento checklist pre budúce nasadenia! 📋
