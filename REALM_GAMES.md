# 🎮 MINIHRY PODLE ŘÍŠÍ

## 📋 Přehled systému
Každá říše má své vlastní dostupné minihry. Čím vyšší level a říše, tím více her máš k dispozici!

**Použití:** `/games` - Zobraz menu s dostupnými hrami pro tvou říši

---

## 🏛️ STARODÁVNÁ ŘÍŠE (Level 1-19)
**Dostupné hry: 2**

### 🎲 Dice - Hoď kostkami
- **Příkaz:** `/dice bet:[částka]`
- **Min sázka:** 100 Kč
- **Pravidla:** Hráč vs Bot - vyšší součet dvou kostek vyhrává
- **Výhra:** 2x sázka
- **Šance:** 50/50

### 🪙 Coinflip - Hoď mincí
- **Příkaz:** `/coinflip bet:[částka] choice:[hlava/orel]`
- **Min sázka:** 100 Kč
- **Pravidla:** Vyber hlava nebo orel, 50% šance
- **Výhra:** 2x sázka
- **Šance:** 50/50

---

## 🏰 STŘEDOVĚKÁ ŘÍŠE (Level 20-39)
**Dostupné hry: 4** (Vše ze Starodávné +)

### 🎰 Slots - Slot Machine
- **Příkaz:** `/slots bet:[částka]`
- **Min sázka:** 50 Kč
- **Pravidla:** 3 válce s animací
- **Výhry:**
  - 💎💎💎 = **50x jackpot**
  - 7️⃣7️⃣7️⃣ = **20x jackpot**
  - Tři stejné symboly = **10x**
  - Dva stejné symboly = **2x**
- **Symboly:** 💎, 7️⃣, 🍒, 🍋, 🍊, 🍇

### 🃏 Blackjack - Karetní hra
- **Příkaz:** `/blackjack bet:[částka]`
- **Min sázka:** 50 Kč
- **Pravidla:** Klasický blackjack, cíl: 21 nebo blíž než dealer
- **Ovládání:** Tlačítka Hit (další karta) / Stand (stůj)
- **Dealer:** Musí táhnout do 17
- **Výhra:** 2x sázka (3x při blackjacku)

---

## 🎨 RENESANČNÍ ŘÍŠE (Level 40-59)
**Dostupné hry: 5** (Vše ze Středověké +)

### 🎡 Gamble - Ruleta
- **Příkaz:** `/gamble amount:[částka] type:[barva]` nebo s `number:[0-36]`
- **Min sázka:** 50 Kč
- **Pravidla:** Casino ruleta s čísly 0-36
- **Sázky:**
  - 🔴 **Červená** (2x) - čísla: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
  - ⚫ **Černá** (2x) - čísla: 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35
  - 🟢 **Zelená/0** (36x) - pouze číslo 0
  - 🎯 **Konkrétní číslo** (36x) - např. `number:17`

---

## 🏙️ MODERNÍ ŘÍŠE (Level 60-79)
**Dostupné hry: 6** (Vše z Renesanční +)

### 📈 Crash - Multiplier Game
- **Příkaz:** `/crash bet:[částka]`
- **Min sázka:** 100 Kč
- **Pravidla:** Sleduj rostoucí multiplier (1.00x → ??)
- **Cíl:** Stiskni "💰 Cash Out" včas, než graf spadne!
- **Výhra:** Sázka × multiplier v okamžiku cash out
- **Riziko:** Pokud nestihnete cash out před crashem = prohra
- **Rozsah:** Multiplier obvykle 1.2x - 10x (vzácně i víc)

---

## 🚀 FUTURISTICKÁ ŘÍŠE (Level 80+)
**Dostupné hry: 7** (Vše z Moderní +)

### ⚛️ Quantum Bet - Kvantová sázka
- **Příkaz:** *(Bude implementováno)*
- **Min sázka:** 500 Kč
- **Pravidla:** Kvantová náhodnost
- **Šance:** 50% na **3x výhru**, 50% na prohru
- **Speciální:** Futuristická hra s nejvyšším rizikem a odměnou

---

## 📊 Tabulka her podle říší

| Říše | Level | Dice | Coin | Slots | BJ | Ruleta | Crash | Quantum |
|------|-------|------|------|-------|-------|--------|-------|---------|
| 🏛️ Starodávná | 1-19 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| 🏰 Středověká | 20-39 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| 🎨 Renesanční | 40-59 | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 🏙️ Moderní | 60-79 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| 🚀 Futuristická | 80+ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 💡 Tipy pro hráče

### Jak odemknout více her?
1. **Level up** - Získávej XP z work, crime, expedice
2. **Auto progres** - Při dosažení levelu 20, 40, 60, 80 automaticky postupuješ do vyšší říše
3. **Více her = více možností** na výhru!

### Strategie podle říše:
- **🏛️ Starodávná (1-19):** Bezpečné hry s 50% šancí - ideální pro začátečníky
- **🏰 Středověká (20-39):** Přibývají slots a blackjack - možnost velkých výher
- **🎨 Renesanční (40-59):** Ruleta přidává riziko i větší odměny
- **🏙️ Moderní (60-79):** Crash game pro adrenalinové zážitky
- **🚀 Futuristická (80+):** Quantum Bet - nejvyšší riziko = nejvyšší odměna

### Doporučené sázky:
- **Začátečníci:** 100-500 Kč na bezpečné hry (Dice, Coin)
- **Pokročilí:** 500-2000 Kč na slots/blackjack
- **Experti:** 2000-10000 Kč na ruletu/crash
- **Profesionálové:** 10000+ Kč na Quantum Bet

---

## 🎯 Quick Reference

```
/games                          → Zobraz dostupné hry
/dice bet:500                   → Dice za 500 Kč
/coinflip bet:200 choice:hlava  → Mince na hlavu
/slots bet:100                  → Slots za 100 Kč
/blackjack bet:500              → Blackjack za 500 Kč
/gamble amount:1000 type:red    → Ruleta na červenou
/crash bet:2000                 → Crash game za 2000 Kč
```

---

**💎 Pro maximální zábavu:** Postupuj do vyšších říší a odemkni všechny hry!
