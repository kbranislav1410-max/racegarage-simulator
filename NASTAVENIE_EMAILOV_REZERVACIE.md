# Nastavenie Emailov pre Rezervácie

Systém Racegarage Simulator automaticky odosiela potvrdzujúce emaily zákazníkom po vytvorení rezervácie.

## Funkcie

Keď zákazník vytvorí rezerváciu cez verejný formulár, automaticky dostane email s potvrdením obsahujúci:

1. **Dátum a čas rezervácie**
2. **Trvanie (v minútach)**
3. **Status** - "Prijatá" (pending), čaká na schválenie

Okrem toho systém vie posielať aj ďalšie typy emailov:
- **Potvrdené** - keď admin potvrdí rezerváciu
- **Zamietnuté** - keď admin zamietne rezerváciu
- **Zrušené** - keď sa rezervácia zruší

## Konfigurácia Email Poskytovateľa

Systém podporuje viacero spôsobov odosielania emailov. Vyberte si jeden podľa vašich potrieb:

### Možnosť 1: Resend (Odporúčané pre produkciu)

Resend je moderný email provider, ktorý je jednoduchý na nastavenie a spoľahlivý.

**Postup:**

1. Zaregistrujte sa na [resend.com](https://resend.com)
2. Vytvorte API kľúč v dashboard
3. Pridajte do `.env` súboru:

```env
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_vas_api_kluc_tu"
EMAIL_FROM="noreply@vasadomena.sk"
```

**Poznámka:** Pre lepšiu doručiteľnosť emailov odporúčame nastaviť vlastnú doménu v Resend nastaveniach.

### Možnosť 2: Nodemailer (SMTP)

Použite existujúci SMTP server (Gmail, SendGrid, Amazon SES, WebSupport, atď.):

**Príklad pre Gmail:**

```env
EMAIL_PROVIDER="nodemailer"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="vas-email@gmail.com"
SMTP_PASS="vas-app-heslo"
EMAIL_FROM="noreply@vasadomena.sk"
```

**Príklad pre WebSupport:**

```env
EMAIL_PROVIDER="nodemailer"
SMTP_HOST="smtp.websupport.sk"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="vas-email@vasadomena.sk"
SMTP_PASS="vase-heslo"
EMAIL_FROM="noreply@vasadomena.sk"
```

**Dôležité pre Gmail:**
- Musíte vytvoriť "App Password" v nastaveniach Google účtu
- Ide to v: Google Account → Security → 2-Step Verification → App Passwords

### Možnosť 3: Console Fallback (Pre vývoj)

Ak nenastavíte žiadneho poskytovateľa, emaily sa budú logovať do konzoly (terminál) namiesto odosielania. To je užitočné pre testovanie.

```env
# Nechajte EMAIL_PROVIDER prázdne alebo ho vymažte
EMAIL_FROM="noreply@racegarage.local"
```

## Krok za Krokom Inštalácia

### 1. Vytvorte .env súbor

Ak ešte nemáte `.env` súbor v root adresári projektu, vytvorte ho:

```bash
cp .env.example .env
```

### 2. Nastavte Email Provider

Vyberte si jednu z možností vyššie a upravte `.env` súbor podľa toho.

### 3. Reštartujte Server

Po zmene `.env` súboru musíte reštartovať vývojový/produkčný server:

```bash
# Zastavte aktuálny server (Ctrl+C)
# Potom spustite znova:
npm run dev
```

### 4. Otestujte Funkčnosť

1. Otvorte rezervačný formulár: `http://localhost:3000/book`
2. Vytvorte novú rezerváciu
3. Skontrolujte:
   - **S Console Provider**: Email sa objaví v termináli
   - **S Resend/Nodemailer**: Email príde na zadanú adresu

## Šablóny Emailov

Systém obsahuje profesionálne navrhnuté email šablóny v dvoch verziách:

- **HTML verzia**: Plnofarebný, responzívny design s inline CSS
- **Text verzia**: Jednoduchá textová verzia pre klientov bez HTML podpory

### Príklad Emailu "Pending" (Prijatá)

```
Predmet: Reservation Request Received - Racing Simulator

Dobrý deň [Meno Zákazníka],

Ďakujeme za vašu žiadosť o rezerváciu! Dostali sme vašu objednávku a čoskoro ju preveríme.

Dátum a čas: 15.2.2026 14:30
Trvanie: 60 minút

Po schválení vašej rezervácie dostanete potvrdzujúci email.
Ak máte otázky, neváhajte nás kontaktovať.

Racegarage Team
```

## Audit Log

Všetky pokusy o odoslanie emailov sú zaznamenané v `AuditLog` tabuľke s informáciami:
- Akcia: `SEND_EMAIL`
- Entita: `Reservation`
- EntityId: Email adresa zákazníka
- Payload: Typ emailu, príjemca, úspešnosť odoslania

## Riešenie Problémov

### Emaily sa neodosielajú

1. **Skontrolujte `.env` súbor:**
   - Je `EMAIL_PROVIDER` nastavený?
   - Sú API kľúče/SMTP údaje správne?
   - Je `.env` súbor v root adresári projektu?

2. **Skontrolujte logy aplikácie:**
   ```bash
   npm run dev
   ```
   - Hľadajte chybové hlášky v konzole
   - Skontrolujte či je provider správne načítaný

3. **Testujte s Console Provider:**
   - Nastavte `EMAIL_PROVIDER=""` (prázdne)
   - Reštartujte server
   - Skúste vytvoriť rezerváciu
   - Email by sa mal objaviť v konzole

### Gmail SMTP nefunguje

1. **Zapnite 2-Step Verification** v Google účte
2. **Vytvorte App Password:**
   - Google Account → Security → 2-Step Verification → App Passwords
   - Vyberte "Mail" a "Other (Custom name)"
   - Skopírujte 16-znakové heslo
   - Použite toto heslo v `SMTP_PASS` namiesto bežného hesla

### Resend API nefunguje

1. **Overte API kľúč:**
   - Prihláste sa do Resend dashboard
   - Skontrolujte že API kľúč je aktívny
   - Vytvorte nový kľúč ak je potrebné

2. **Skontrolujte email doménu:**
   - Pre testovanie môžete používať Resend doménu
   - Pre produkciu nastavte vlastnú doménu

## Produkčné Odporúčania

1. **Používajte Resend** - najjednoduchší a najspoľahlivejší
2. **Nastavte vlastnú doménu** - lepšia doručiteľnosť emailov
3. **Monitorujte audit logy** - sledujte úspešnosť odosielania
4. **Testujte pred nasadením** - vytvorte testovacie rezervácie
5. **Nastavte backup** - môžete mať SMTP ako zálohu

## Prispôsobenie Emailov

Ak chcete zmeniť vzhľad alebo obsah emailov:

1. Otvorte súbor: `/src/lib/email/templates.ts`
2. Upravte funkcie:
   - `generateReservationHTML()` - HTML verzia
   - `generateReservationText()` - textová verzia
3. Uložte zmeny a reštartujte server

## Bezpečnosť

**DÔLEŽITÉ:** Ochrana citlivých údajov!

- **Nikdy** nenahrávajte `.env` súbor do Git repozitára!
- **Nikdy** nevkladajte reálne API kľúče alebo heslá do `.env.example` súboru!
- `.env` súbor je automaticky ignorovaný cez `.gitignore`
- `.env.example` má obsahovať iba vzorové/placeholder hodnoty (napr. `re_your_api_key_here`)
- Pre produkčné servery nastavte environment premenné priamo v hostingovom prostredí
- Pre Vercel: Project Settings → Environment Variables
- Pre iné platformy: konzultujte dokumentáciu platformy
- Ak omylom nahráte citlivé údaje, okamžite zmeňte API kľúče a heslá!

## Záver

Po správnom nastavení budú zákazníci automaticky dostávať potvrdzujúce emaily pri každej vytvorení rezervácie. Systém je navrhnutý tak, aby zlyhanie odoslania emailu neovplyvnilo vytvorenie rezervácie - rezervácia sa vytvorí aj keď email zlyhá.

Ak máte ďalšie otázky alebo problémy, skontrolujte `EMAIL_NOTIFICATIONS.md` pre pokročilé nastavenia emailov pre ride completion notifikácie.
