# Správa Nepoužitých Voucherov

## Čo Je To?

Nová funkcionalita umožňujúca **spravovať nepoužité vouchery** priamo z sekcie "Moje vouchery":
- **Predĺženie platnosti** - Predĺžte expiráciu voucheru
- **Odstránenie** - Vymažte nepoužitý voucher

**Dôležité:** Tieto funkcie sú len pre **nepoužité vouchery** (status NEW alebo SENT). Použité vouchery sa nedajú upravovať ani mazať.

---

## Kde To Nájdem?

```
Menu → Vouchery → Moje vouchery → Aktívne Vouchery
```

Pri každom aktívnom vouchere uvidíte **2 tlačidlá**:
- 📅 **Kalendár** - Predĺžiť platnosť
- 🗑️ **Kôš** - Odstrániť

---

## Ako Predĺžiť Platnosť Voucheru

### Krok za Krokom

**1. Nájdite voucher v sekcii "Aktívne Vouchery"**
```
Voucher kód: ABCD-1234-EFGH
30 minút • Ján Novák
Platnosť do: 15.07.2024
[📅] [🗑️]
```

**2. Kliknite na ikonu kalendára 📅**
- Otvorí sa modálne okno

**3. Nastavte novú platnosť**
```
┌────────────────────────────────────┐
│ Predĺžiť Platnosť Voucheru         │
├────────────────────────────────────┤
│ Voucher kód: ABCD-1234-EFGH       │
│ Aktuálna platnosť do: 15.07.2024  │
│                                    │
│ Nová platnosť do: [15.01.2025]    │
│                                    │
│ [Zrušiť]  [Predĺžiť]              │
└────────────────────────────────────┘
```

**4. Kliknite "Predĺžiť"**
- Voucher sa aktualizuje
- Zobrazí sa zelená notifikácia: "Platnosť voucheru bola predĺžená!"

### Pravidlá
- ✅ Nový dátum **musí byť v budúcnosti**
- ✅ Predvolený dátum: **+6 mesiacov** od dnešného dňa
- ❌ Nedá sa predĺžiť použitý voucher
- ❌ Nedá sa predĺžiť zrušený voucher

---

## Ako Odstrániť Voucher

### Krok za Krokom

**1. Nájdite voucher v sekcii "Aktívne Vouchery"**

**2. Kliknite na ikonu koša 🗑️**
- Otvorí sa potvrdzovacie okno

**3. Potvrďte odstránenie**
```
┌────────────────────────────────────┐
│ Odstrániť Voucher                  │
├────────────────────────────────────┤
│ Voucher kód: ABCD-1234-EFGH       │
│ Vytvorený pre: Ján Novák          │
│ jan.novak@email.sk                 │
│                                    │
│ Naozaj chcete odstrániť tento     │
│ voucher? Táto akcia je nevratná.   │
│                                    │
│ [Zrušiť]  [Odstrániť]             │
└────────────────────────────────────┘
```

**4. Kliknite "Odstrániť"**
- Voucher sa natrvalo vymaže
- Zobrazí sa zelená notifikácia: "Voucher bol úspešne odstránený!"

### Pravidlá
- ✅ Dá sa odstrániť len nepoužitý voucher (NEW, SENT)
- ❌ **Nedá sa odstrániť použitý voucher** (REDEEMED)
- ⚠️ **Akcia je nevratná** - voucher sa nedá obnoviť

---

## Príklady Použitia

### Príklad 1: Predĺženie Platnosti

**Situácia:** Zákazník potrebuje viac času na použitie voucheru

```
1. Pôvodná platnosť: 15.07.2024
2. Klik na 📅
3. Nastaviť: 15.01.2025
4. Klik "Predĺžiť"
✓ Nová platnosť: 15.01.2025
```

### Príklad 2: Chybne Vytvorený Voucher

**Situácia:** Omylom vytvorený voucher s nesprávnymi údajmi

```
1. Nájsť voucher v Aktívnych voucheroch
2. Klik na 🗑️
3. Potvrdiť "Odstrániť"
✓ Voucher odstránený
→ Vytvoriť nový so správnymi údajmi
```

### Príklad 3: Zákazník Zrušil Objednávku

**Situácia:** Zákazník si voucher nekúpil

```
1. Nájsť nepoužitý voucher
2. Klik na 🗑️
3. Potvrdiť odstránenie
✓ Voucher vymazaný z databázy
```

---

## Stavy Voucherov

### Upraviteľné Stavy
- 🟢 **NEW** - Nový voucher, dá sa upravovať aj mazať
- 🟢 **SENT** - Odoslaný voucher, dá sa upravovať aj mazať

### Neupraviteľné Stavy
- 🔴 **REDEEMED** - Použitý voucher, **nedá sa** upravovať ani mazať
- 🔴 **EXPIRED** - Expirovaný voucher, **nedá sa** upravovať (len mazať)
- 🔴 **CANCELLED** - Zrušený voucher, **nedá sa** upravovať ani mazať

---

## Bezpečnosť

### API Validácia
```javascript
// Kontrola pri predlžovaní
if (voucher.status === "REDEEMED" || voucher.status === "CANCELLED") {
  return "Cannot extend redeemed or cancelled voucher";
}

// Kontrola pri mazaní
if (voucher.status === "REDEEMED") {
  return "Cannot delete redeemed voucher";
}
```

### Audit Log
Každá akcia sa zaznamenáva:
```
AKCIA          VOUCHER KÓD      DETAILY
UPDATE         ABCD-1234-EFGH   extend_expiration: 15.07.2024 → 15.01.2025
DELETE         WXYZ-5678-IJKL   status: NEW, minutes: 30
```

---

## FAQ

### 1. Môžem predĺžiť použitý voucher?
**Nie.** Použité vouchery (REDEEMED) sa nedajú predĺžiť ani upravovať.

### 2. Môžem odstrániť použitý voucher?
**Nie.** Použité vouchery sa nedajú vymazať kvôli zachovaniu histórie.

### 3. Môžem obnoviť odstránený voucher?
**Nie.** Odstránenie je nevratné. Musíte vytvoriť nový voucher.

### 4. Ako ďaleko do budúcnosti môžem predĺžiť voucher?
**Bez obmedzenia.** Môžete nastaviť akýkoľvek dátum v budúcnosti.

### 5. Prečo nevidím tlačidlá pri mojom vouchere?
Tlačidlá sa zobrazujú len pri **Aktívnych voucheroch** (NEW, SENT). Použité vouchery sú v sekcii "Použité Vouchery" bez tlačidiel.

### 6. Kde vidím históriu zmien?
V **Audit logu** (ak je dostupný) sa zaznamenávajú všetky zmeny.

---

## Technické Detaily

### API Endpointy

**Predĺženie platnosti:**
```http
PATCH /api/vouchers?id={voucherId}
Content-Type: application/json

{
  "expiresAt": "2025-01-15"
}
```

**Odpoveď:**
```json
{
  "id": "...",
  "code": "ABCD-1234-EFGH",
  "expiresAt": "2025-01-15T00:00:00.000Z",
  ...
}
```

**Odstránenie:**
```http
DELETE /api/vouchers?id={voucherId}
```

**Odpoveď:**
```json
{
  "success": true
}
```

### Databázové Zmeny

**Predĺženie - UPDATE:**
```sql
UPDATE vouchers 
SET expires_at = '2025-01-15' 
WHERE id = 'voucher_id';
```

**Odstránenie - DELETE:**
```sql
DELETE FROM vouchers 
WHERE id = 'voucher_id';
```

---

## Výhody Funkcie

### Flexibilita
✅ **Predĺžte platnosť** keď zákazník potrebuje viac času
✅ **Odstráňte chyby** bez potreby databázových príkazov
✅ **Spravujte vouchers** priamo z UI

### Bezpečnosť
✅ **Ochrana použitých voucherov** - nedajú sa zmeniť
✅ **Potvrdzovacie dialógy** - prevencia omylov
✅ **Audit logging** - sledovanie všetkých zmien

### Používateľská Skúsenosť
✅ **Jednoduché tlačidlá** - intuitívne ikony
✅ **Jasné notifikácie** - okamžitá spätná väzba
✅ **Slovak preklad** - celé UI v slovenčine

---

## Zhrnutie

| Funkcia | Ikona | Čo Robí | Pre Stavy |
|---------|-------|---------|-----------|
| Predĺžiť platnosť | 📅 | Zmení dátum expirácie | NEW, SENT |
| Odstrániť | 🗑️ | Vymaže voucher | NEW, SENT, EXPIRED |

**Použitie:**
1. Choďte do **Vouchery → Moje vouchery**
2. V sekcii **Aktívne Vouchery** nájdite voucher
3. Kliknite na ikonu **📅** (predĺžiť) alebo **🗑️** (odstrániť)
4. Potvrďte akciu

**Pamätajte:**
- Len nepoužité vouchery sa dajú upravovať
- Odstránenie je nevratné
- Všetky zmeny sa zaznamenávajú v audit logu

---

*Implementované: Január 2024*  
*Verzia: 1.0.0*  
*Status: ✅ Production Ready*
