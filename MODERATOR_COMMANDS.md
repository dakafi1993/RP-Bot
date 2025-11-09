# 🛡️ MODERÁTOR PŘÍKAZY - DK RP Bot

## 🔑 Přístup
- **Moderátor ID:** `1404534814857494708`
- **Omezení:** Max 50,000 Kč na příkaz, nelze měnit adminy

---

## 💰 Správa peněz

### `/admin addmoney`
Přidá hráči peníze
- **Parametry:**
  - `user` - Označený hráč
  - `amount` - Počet Kč (max 50,000)
- **Limit:** ⚠️ **Maximum 50,000 Kč**
- **Příklad:** `/admin addmoney @User amount:50000`
- **Poznámka:** Pokud zadáš více než 50k, dostaneš chybovou hlášku

### `/admin removemoney`
Odebere hráči peníze (pokuta)
- **Parametry:**
  - `user` - Označený hráč
  - `amount` - Počet Kč
  - `reason` - Důvod pokuty (volitelné)
- **Omezení:** ⚠️ **Nelze odebrat peníze adminům**
- **Příklad:** `/admin removemoney @User amount:5000 reason:Spam`
- **Poznámka:** Pokud se pokusíš odebrat adminovi, dostaneš zamítnutí

---

## 🔍 Kontrola hráčů

### `/admin check`
Zobrazí detailní informace o hráči
- **Parametry:**
  - `user` - Označený hráč
- **Příklad:** `/admin check @User`

**Zobrazené informace:**
- 💰 Peníze
- ⭐ Level & XP
- ✅ Výhry & Prohry
- 📈 Win Rate
- 🆔 User ID
- 🎭 Rasa
- 🏆 Rank

---

## 📋 Co NEMŮŽEŠ dělat jako moderátor

❌ `/admin setmoney` - Pouze admin
❌ `/admin addxp` - Pouze admin
❌ `/admin setpickaxe` - Pouze admin
❌ `/admin addores` - Pouze admin
❌ `/admin addmoney` nad 50,000 Kč - Max limit
❌ `/admin removemoney` na admina - Ochrana adminů

---

## 💡 Rychlé tipy pro moderátory

### Odměna za event
```
/admin addmoney @Winner amount:10000
```

### Pokuta za spam
```
/admin removemoney @User amount:2000 reason:Spam v chatu
```

### Kontrola hráče
```
/admin check @User
```

### Pomoc novému hráči
```
/admin addmoney @NewPlayer amount:5000
```

---

## ⚠️ Důležité poznámky

1. **Limit 50,000 Kč:** Nemůžeš přidat více než 50k najednou
2. **Ochrana adminů:** Nemůžeš odebrat peníze adminovi
3. **Základní oprávnění:** Máš přístup k addmoney, removemoney a check
4. **Channel omezení:** Bot funguje pouze v kanálu `1436692725838774343`
5. **Reason je volitelný:** U removemoney nemusíš zadávat důvod

---

## 📊 Přehled oprávnění

| Příkaz | Moderátor | Poznámka |
|--------|-----------|----------|
| `/admin addmoney` | ✅ Max 50k | Limit 50,000 Kč |
| `/admin removemoney` | ✅ | Nelze adminům |
| `/admin check` | ✅ | Bez omezení |
| `/admin setmoney` | ❌ | Pouze admin |
| `/admin addxp` | ❌ | Pouze admin |
| `/admin setpickaxe` | ❌ | Pouze admin |
| `/admin addores` | ❌ | Pouze admin |

---

## 🎯 Tvoje User ID

**Moderátor:** `1404534814857494708`

---

## 🆘 Co dělat když...

### "❌ Moderátor může přidat max 50000 Kč!"
- Snižte částku na max 50,000 nebo požádejte admina

### "❌ Moderátor nemůže odebrat peníze adminovi!"
- Tento příkaz je blokován, kontaktujte admina

### "❌ Pouze admin může..."
- Tento příkaz nemáte oprávnění použít

### "❌ Hráč ještě nemá postavu!"
- Hráč musí nejdřív použít `/create`

---

*Poslední aktualizace: 9.11.2025*
*DK RP Bot v1.0 - Moderátorská příručka*
