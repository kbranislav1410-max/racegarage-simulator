# Race Garage Simulator

Race Garage Simulator je webová aplikácia na správu jazdcov, jázd a platieb pre pretekársku garáž.

## Funkcie

### Prehľad (Overview)
- **Posledné jazdy**: Zobrazuje najnovšie jazdy s informáciami o jazdcovi, trati, trvaní a sume
- **Posledná aktivita jazdcov**: Zobrazuje najnovších jazdcov a ich aktivity
- Platby nie sú zobrazené na prehľade, ale sumy jázd áno

### Správa jazdcov (Riders)
- Pridávanie nových jazdcov
- Zobrazenie zoznamu všetkých jazdcov
- Odstránenie jazdcov

### Správa jázd (Rides)
- Pridávanie nových jázd s možnosťou pridať aj platbu
- Zobrazenie všetkých jázd so sumami
- Odstránenie jázd (automaticky odstráni aj súvisiacu platbu)

### Správa platieb (Payments)
- Zobrazenie všetkých platieb
- Odstránenie platieb (automaticky odstráni aj súvisiacu jazdu)

## Kaskádové mazanie

**Dôležité**: Platby sú závislé od jázd. Pri odstránení jazdy alebo platby sa automaticky odstráni aj druhá položka:
- Odstránenie jazdy → automaticky odstráni platbu
- Odstránenie platby → automaticky odstráni jazdu

## Technológie

- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Frontend**: EJS šablóny, vanilla CSS
- **Kaskádové mazanie**: SQLite triggre

## Inštalácia a spustenie

1. Nainštalujte závislosti:
```bash
npm install
```

2. (Voliteľné) Naplňte databázu testovacími dátami:
```bash
node seed.js
```

3. Spustite aplikáciu:
```bash
npm start
```

4. Otvorte prehliadač na adrese:
```
http://localhost:3000
```

## Databázová štruktúra

### Riders (Jazdci)
- `id`: Primárny kľúč
- `name`: Meno jazdca (povinné)
- `email`: Email
- `phone`: Telefón
- `created_at`, `updated_at`: Časové pečiatky

### Rides (Jazdy)
- `id`: Primárny kľúč
- `rider_id`: Cudzí kľúč na Riders
- `date`: Dátum jazdy (povinné)
- `track`: Názov trate (povinné)
- `duration`: Trvanie v minútach
- `notes`: Poznámky
- `created_at`, `updated_at`: Časové pečiatky

### Payments (Platby)
- `id`: Primárny kľúč
- `ride_id`: Cudzí kľúč na Rides (s cascade delete)
- `amount`: Suma platby (povinné)
- `payment_method`: Spôsob platby (cash/card/transfer)
- `payment_date`: Dátum platby
- `created_at`, `updated_at`: Časové pečiatky

## Licencia

ISC