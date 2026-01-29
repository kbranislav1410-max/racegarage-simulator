# Filter Období pre Jazdy

## Čo je to?

Nový filter v sekcii **Jazdy**, ktorý umožňuje filtrovať jazdy podľa **časového obdobia** (od-do) namiesto len jedného dňa.

## Kde to nájdem?

1. Prihláste sa do aplikácie
2. V menu kliknite na **"Jazdy"**
3. Filter je hneď pod tlačidlom "Záznam jazdy"

## Ako to funguje?

### Rozhranie

Filter má **2 dátumové polia**:
```
📅 Od: [2024-01-15]  Do: [2024-01-31]  [Exportovať CSV]
```

- **Od:** Začiatok obdobia (od 00:00:00)
- **Do:** Koniec obdobia (do 23:59:59)
- **Tlačidlo CSV:** Exportuje všetky jazdy v zvolenom období

### Predvolené hodnoty

Pri načítaní stránky:
- **Od:** Dnešný dátum
- **Do:** Dnešný dátum

Toto zobrazí jazdy len z dnešného dňa (rovnaké správanie ako predtým).

## Príklady použitia

### Príklad 1: Jazdy za jeden deň
```
Od: 2024-01-20
Do: 2024-01-20
→ Zobrazí jazdy len z 20. januára 2024
```

### Príklad 2: Jazdy za týždeň
```
Od: 2024-01-15
Do: 2024-01-21
→ Zobrazí jazdy od 15. do 21. januára 2024 (7 dní)
```

### Príklad 3: Jazdy za mesiac
```
Od: 2024-01-01
Do: 2024-01-31
→ Zobrazí všetky jazdy v januári 2024
```

### Príklad 4: Vlastné obdobie
```
Od: 2024-01-10
Do: 2024-02-05
→ Zobrazí jazdy od 10. januára do 5. februára 2024
```

## Funkcie

### ✅ Filtrovanie jázd
- Zmení sa ktorýkoľvek dátum → automaticky načíta jazdy
- Tabuľka sa aktualizuje okamžite
- Zobrazí sa správny počet jázd pre zvolené obdobie

### ✅ Export do CSV
- Tlačidlo "Exportovať CSV" exportuje **všetky jazdy** v zvolenom období
- Názov súboru obsahuje obdobie:
  - Jeden deň: `rides-2024-01-20.csv`
  - Viac dní: `rides-2024-01-15-to-2024-01-31.csv`

### ✅ Prázdny stav
Ak v zvolenom období nie sú žiadne jazdy, zobrazí sa:
```
Žiadne jazdy pre obdobie 2024-01-15 - 2024-01-31.
Kliknite "Záznam jazdy" pre pridanie.
```

## Technické detaily

### API Endpointy

**GET /api/rides**
```
?dateFrom=2024-01-15&dateTo=2024-01-31
```
- `dateFrom` - Začiatok obdobia (YYYY-MM-DD)
- `dateTo` - Koniec obdobia (YYYY-MM-DD)
- Oba parametre sú voliteľné
- Ak nie sú zadané, vráti všetky jazdy

**GET /api/rides/export**
```
?dateFrom=2024-01-15&dateTo=2024-01-31
```
- Rovnaké parametre ako GET /api/rides
- Vráti CSV súbor s jazdami v období

### Backward Compatibility

API stále podporuje starý spôsob volania:
```
?date=2024-01-20
```
Toto je ekvivalent:
```
?dateFrom=2024-01-20&dateTo=2024-01-20
```

### Databázový dotaz

```sql
SELECT * FROM ride_sessions
WHERE start_at >= '2024-01-15 00:00:00'
  AND start_at <= '2024-01-31 23:59:59'
ORDER BY start_at DESC
```

## Výhody

### Pred
- ❌ Filter len pre jeden deň
- ❌ Museli ste meniť dátum viackrát
- ❌ Export len jedného dňa
- ❌ Nemohli ste vidieť jazdy za týždeň/mesiac

### Po
- ✅ Filter pre celé obdobie (od-do)
- ✅ Nastavíte raz a vidíte všetko
- ✅ Export celého obdobia jedným kliknutím
- ✅ Vidíte jazdy za týždeň/mesiac/vlastné obdobie

## FAQ

### 1. Čo sa stane ak nastavím "Od" na neskorší dátum ako "Do"?
API to zvládne, ale nezobrazia sa žiadne jazdy (logicky nesprávne obdobie).

**Riešenie:** Nastavte "Od" na skorší alebo rovnaký dátum ako "Do".

### 2. Môžem zobraziť všetky jazdy?
Áno! Nenastav žiadny dátum (alebo nastavte veľmi široké obdobie).

### 3. Export CSV exportuje len zobrazené jazdy?
Áno, exportuje presne tie jazdy, ktoré vidíte v tabuľke pre zvolené obdobie.

### 4. Ako rýchlo sa načítajú jazdy?
- Malé obdobia (deň/týždeň): Okamžite
- Veľké obdobia (mesiac/rok): 1-2 sekundy

### 5. Je počet jázd limitovaný?
Nie, API vráti všetky jazdy v zvolenom období. Pre veľmi veľké obdobia (napr. celý rok) môže načítanie trvať dlhšie.

### 6. Dá sa to použiť aj na mobile?
Áno! Dátumové inputy fungujú aj na mobilných zariadeniach s natívnym date pickerom.

## Tipy

### 💡 Rýchle obdobia
- **Dnes:** Od = Do = dnes
- **Tento týždeň:** Od = pondelok, Do = dnes
- **Tento mesiac:** Od = 1. deň mesiaca, Do = dnes
- **Minulý mesiac:** Od = 1. deň minulého mesiaca, Do = posledný deň minulého mesiaca

### 💡 Klávesové skratky
V date input:
- `↑` / `↓` - Zmena dátumu o 1 deň
- `PgUp` / `PgDn` - Zmena mesiaca
- `Home` / `End` - Prvý/posledný deň mesiaca

## Zhrnutie

| Funkcia | Stav |
|---------|------|
| Filter od-do | ✅ Funguje |
| Automatické načítanie | ✅ Funguje |
| Export CSV s obdobím | ✅ Funguje |
| Prázdny stav s obdobím | ✅ Funguje |
| Backward compatibility | ✅ Funguje |
| Slovak labels | ✅ Hotové |

**Filter období pre jazdy je plne funkčný a pripravený na používanie!** 🎉

---

*Implementované: Január 2024*  
*Verzia: 1.0.0*
