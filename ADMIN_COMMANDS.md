# 👑 ADMIN PŘÍKAZY - DK RP Bot

## 🔑 Přístup
- **Admin:** `1436690629949263964` (plná práva)
- **Moderátor:** `1404534814857494708` (omezená práva - max 50,000 Kč)

---

## 💰 Správa peněz

### `/admin addmoney`
Přidá hráči peníze
- **Parametry:**
  - `user` - Označený hráč
  - `amount` - Počet Kč
- **Oprávnění:** Admin (neomezeno) | Moderátor (max 50,000 Kč)
- **Příklad:** `/admin addmoney @Dakafi amount:100000`

### `/admin removemoney`
Odebere hráči peníze (pokuta)
- **Parametry:**
  - `user` - Označený hráč
  - `amount` - Počet Kč
  - `reason` - Důvod pokuty (volitelné)
- **Oprávnění:** Admin (všichni) | Moderátor (nelze odebrat adminům)
- **Příklad:** `/admin removemoney @User amount:5000 reason:Podvádění`
- **Poznámka:** Moderátor nemůže odebrat peníze adminovi

### `/admin setmoney`
Nastaví hráči přesnou částku peněz
- **Parametry:**
  - `user` - Označený hráč
  - `amount` - Přesná částka v Kč
- **Oprávnění:** ⚠️ **Pouze Admin**
- **Příklad:** `/admin setmoney @User amount:50000`

---

## ⭐ Správa XP & Levelu

### `/admin addxp`
Přidá hráči XP (automatický level up při 100+ XP)
- **Parametry:**
  - `user` - Označený hráč
  - `amount` - Počet XP
- **Oprávnění:** ⚠️ **Pouze Admin**
- **Příklad:** `/admin addxp @User amount:500`
- **Poznámka:** Bot automaticky přidá level pokud XP ≥ 100

---

## ⛏️ Správa těžebního vybavení

### `/admin setpickaxe`
Nastaví hráči krumpáč
- **Parametry:**
  - `user` - Označený hráč
  - `pickaxe` - Typ krumpáče (wooden/iron/diamond)
- **Oprávnění:** ⚠️ **Pouze Admin**
- **Příklad:** `/admin setpickaxe @User pickaxe:diamond`

**Typy krumpáčů:**
| Emoji | Název | Hodnota | Drop Rate |
|-------|-------|---------|-----------|
| 🪵 | Dřevěný | `wooden` | 80% železo, 20% měď |
| ⚙️ | Železný | `iron` | 50% železo, 30% měď, 20% zlato |
| 💎 | Diamantový | `diamond` | 30% železo, 30% měď, 30% zlato, 10% diamant |

---

## 💎 Správa kovů

### `/admin addores`
Přidá hráči kovy do inventáře
- **Parametry:**
  - `user` - Označený hráč
  - `iron` - Počet železa (volitelné)
  - `copper` - Počet mědi (volitelné)
  - `gold` - Počet zlata (volitelné)
  - `diamond` - Počet diamantu (volitelné)
- **Oprávnění:** ⚠️ **Pouze Admin**
- **Příklad:** `/admin addores @User iron:100 copper:50 gold:20 diamond:5`
- **Poznámka:** Musíš zadat alespoň jeden kov

**Hodnoty kovů:**
| Kov | Emoji | Cena za kus |
|-----|-------|-------------|
| Železo | ⚙️ | 50 Kč |
| Měď | 🔶 | 100 Kč |
| Zlato | 🟡 | 500 Kč |
| Diamant | 💎 | 2,000 Kč |

---

## 🔍 Kontrola hráčů

### `/admin check`
Zobrazí detailní informace o hráči
- **Parametry:**
  - `user` - Označený hráč
- **Oprávnění:** Admin | Moderátor
- **Příklad:** `/admin check @User`

**Zobrazené info:**
- 💰 Peníze
- ⭐ Level & XP
- ✅ Výhry & Prohry
- 📈 Win Rate
- 🆔 User ID
- 🎭 Rasa
- 🏆 Rank

---

## 📋 Přehled oprávnění

| Příkaz | Admin | Moderátor |
|--------|-------|-----------|
| `/admin addmoney` | ✅ Neomezeno | ✅ Max 50,000 Kč |
| `/admin removemoney` | ✅ Všichni | ✅ Nelze adminům |
| `/admin setmoney` | ✅ | ❌ |
| `/admin addxp` | ✅ | ❌ |
| `/admin setpickaxe` | ✅ | ❌ |
| `/admin addores` | ✅ | ❌ |
| `/admin check` | ✅ | ✅ |

---

## 💡 Rychlé tipy

### Nový hráč setup
```
1. /admin addmoney @User amount:100000
2. /admin setpickaxe @User pickaxe:iron
3. /admin addxp @User amount:200
4. /admin addores @User iron:50 copper:20
```

### Event odměny
```
/admin addmoney @Winner amount:50000
/admin addxp @Winner amount:500
/admin addores @Winner gold:10 diamond:2
```

### Pokuta za porušení pravidel
```
/admin removemoney @User amount:10000 reason:Spam v chatu
```

---

## ⚠️ Důležité poznámky

1. **Moderátor limit:** Moderátoři mohou přidat max 50,000 Kč najednou
2. **XP level up:** Bot automaticky přidá level při dosažení 100 XP
3. **Kovy v /admin addores:** Musíš zadat alespoň jeden typ kovu
4. **User ID kontrola:** Všechny příkazy kontrolují User ID, ne Discord role
5. **Channel omezení:** Bot funguje pouze v kanálu `1436692725838774343`

---

## 🎯 User ID Reference

- **Admin:** `1436690629949263964`
- **Moderátor:** `1404534814857494708`

Pro zjištění User ID jiného hráče použij: `/admin check @User`

---

*Poslední aktualizace: 9.11.2025*
*DK RP Bot v1.0 - Administrátorská příručka*
