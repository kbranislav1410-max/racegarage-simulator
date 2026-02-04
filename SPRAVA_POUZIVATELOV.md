# Správa Používateľov - User Management

## Prehľad

Funkcia správy používateľov umožňuje super administrátorovi vytvárať, upravovať a mazať používateľov aplikácie.

## Prístup

**Iba SUPER_ADMIN má prístup k správe používateľov.**

- ✅ SUPER_ADMIN - plný prístup
- ❌ ADMIN - žiadny prístup
- ❌ USER - žiadny prístup

## Ako pristúpiť

1. Prihláste sa ako SUPER_ADMIN
2. V menu kliknite na "Používatelia" (ikona používateľa s ozubeným kolesom)
3. Otvorí sa stránka so zoznamom všetkých používateľov

## Funkcie

### 1. Zobrazenie zoznamu používateľov

Tabuľka zobrazuje:
- **Email** - prihlasovací email
- **Meno** - celé meno používateľa
- **Rola** - SUPER_ADMIN, ADMIN alebo USER
- **Vytvorený** - dátum vytvorenia účtu
- **Akcie** - tlačidlá na úpravu a zmazanie

### 2. Vytvorenie nového používateľa

**Postup:**
1. Kliknite na tlačidlo "Nový používateľ" (vpravo hore)
2. Vyplňte formulár:
   - **Email** - jedinečný email (povinné)
   - **Meno** - celé meno (povinné)
   - **Heslo** - bezpečné heslo (povinné)
   - **Rola** - vyberte USER, ADMIN alebo SUPER_ADMIN
3. Kliknite "Vytvoriť"

**Poznámky:**
- Email musí byť jedinečný (nemôže existovať iný používateľ s rovnakým emailom)
- Heslo je automaticky zahashované (bcrypt)
- Používateľ môže okamžite použiť email a heslo na prihlásenie

### 3. Úprava používateľa

**Postup:**
1. Kliknite na ikonu ceruzky (Upraviť) pri používateľovi
2. Upravte údaje:
   - **Email** - môžete zmeniť (musí byť jedinečný)
   - **Meno** - môžete zmeniť
   - **Heslo** - voliteľné (nechajte prázdne pre zachovanie)
   - **Rola** - môžete zmeniť
3. Kliknite "Uložiť"

**Obmedzenia:**
- ❌ Nemôžete zmeniť vlastnú rolu (bezpečnostné opatrenie)
- Ak nechcete zmeniť heslo, nechajte pole prázdne

### 4. Zmazanie používateľa

**Postup:**
1. Kliknite na ikonu koša (Zmazať) pri používateľovi
2. Potvrďte akciu v dialógu
3. Používateľ bude natrvalo zmazaný

**Obmedzenia:**
- ❌ Nemôžete zmazať vlastný účet
- ⚠️ Akcia je nevratná!

## Role používateľov

### SUPER_ADMIN
- Plný prístup k celej aplikácii
- Môže vytvárať, upravovať a mazať používateľov
- Môže mazať záznamy (jazdy, platby, atď.)
- Prístup k finančným údajom
- Prístup k nastaveniam

### ADMIN
- Prístup k väčšine funkcií aplikácie
- Nemôže spravovať používateľov
- Nemôže mazať záznamy
- Prístup k finančným údajom
- Prístup k nastaveniam

### USER
- Základný prístup k aplikácii
- Môže pridávať a upravovať záznamy
- Nemôže mazať záznamy
- Nemá prístup k finančným údajom
- Nemá prístup k nastaveniam

## Bezpečnosť

### Heslá
- Všetky heslá sú hashované pomocou bcrypt
- Heslo nie je nikde viditeľné v čistom texte
- Pri úprave používateľa môžete heslo nechať prázdne (zachová sa staré)

### Oprávnenia
- Iba SUPER_ADMIN má prístup k správe používateľov
- API kontroluje oprávnenia pri každom požiadavku
- Nemôžete si zmazať vlastný účet
- Nemôžete si zmeniť vlastnú rolu

### Email
- Email musí byť jedinečný
- Používa sa na prihlásenie
- Kontrola jedinečnosti pri vytvorení a úprave

## API Endpointy

Ak potrebujete pristupovať programaticky:

### Získať zoznam používateľov
```http
GET /api/users
Authorization: Bearer {token}
```

### Vytvoriť používateľa
```http
POST /api/users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123",
  "role": "USER"
}
```

### Upraviť používateľa
```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newemail@example.com",
  "name": "John Smith",
  "password": "newPassword123",  // voliteľné
  "role": "ADMIN"
}
```

### Zmazať používateľa
```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

## Často kladené otázky (FAQ)

### Q: Môžem vytvoriť viacero SUPER_ADMIN účtov?
**A:** Áno, môžete vytvoriť viacero SUPER_ADMIN účtov. Každý SUPER_ADMIN má rovnaké oprávnenia.

### Q: Čo sa stane ak zabudnem heslo používateľa?
**A:** SUPER_ADMIN môže upraviť používateľa a nastaviť nové heslo.

### Q: Môžem zmazať účet SUPER_ADMIN?
**A:** Áno, ale nemôžete zmazať vlastný účet. Musíte použiť iný SUPER_ADMIN účet.

### Q: Môže ADMIN vytvárať používateľov?
**A:** Nie, iba SUPER_ADMIN môže spravovať používateľov.

### Q: Kde môžem vidieť menu položku "Používatelia"?
**A:** Menu položka "Používatelia" je viditeľná iba pre SUPER_ADMIN. Ak ste ADMIN alebo USER, túto položku neuvidíte.

### Q: Môžem zmeniť rolu existujúceho používateľa?
**A:** Áno, SUPER_ADMIN môže zmeniť rolu akéhokoľvek používateľa okrem vlastnej.

### Q: Je možné obnoviť zmazaného používateľa?
**A:** Nie, zmazanie je trvalé. Musíte vytvoriť nového používateľa s rovnakými údajmi.

## Riešenie problémov

### "Email already in use"
- Email, ktorý sa snažíte použiť, už existuje v systéme
- Použite iný email alebo upravte existujúceho používateľa

### "Cannot delete your own account"
- Nemôžete zmazať vlastný účet z bezpečnostných dôvodov
- Požiadajte iného SUPER_ADMIN o zmazanie vášho účtu

### "Cannot change your own role"
- Nemôžete zmeniť vlastnú rolu z bezpečnostných dôvodov
- Požiadajte iného SUPER_ADMIN o zmenu vašej role

### "Unauthorized - Only SUPER_ADMIN can manage users"
- Nemáte oprávnenia na správu používateľov
- Kontaktujte SUPER_ADMIN

### Stránka "Používatelia" nie je v menu
- Menu položka je viditeľná iba pre SUPER_ADMIN
- Prihláste sa ako SUPER_ADMIN

## Kontakt

V prípade problémov alebo otázok kontaktujte technickú podporu alebo hlavného SUPER_ADMIN vašej organizácie.
