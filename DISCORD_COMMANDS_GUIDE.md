# 🎮 DK RP Bot - Kompletní příručka příkazů

> **Vítej v DK RP Bot systému!** Toto je tvůj kompletní průvodce všemi příkazy a funkcemi. Vytvoř si postavu, vydělávej peníze, hrái hazardní hry, těž kovy a staň se legendou!

---

## 📋 OBSAH
1. [Začátek hry](#-začátek-hry)
2. [Ekonomika](#-ekonomika)
3. [Rasy & Bonusy](#-rasy--bonusy)
4. [Výdělek](#-výdělek)
5. [Hazardní hry](#-hazardní-hry)
6. [PvP systém](#-pvp-systém)
7. [Obchod](#-obchod)
8. [Mining & Upgrady](#%EF%B8%8F-mining--upgrady)
9. [Admin příkazy](#-admin-příkazy)

---

## 🎯 Začátek hry

### `/create`
**Vytvoř si postavu** - První příkaz který musíš použít!
- Vyber si **jméno postavy**
- Zvol jednu z **5 ras** (každá má unikátní bonusy)
- Dostaneš **startovací kapitál 1000 Kč**
- ⚠️ Můžeš vytvořit jen **JEDNU postavu** na účet

### `/profile`
**Zobraz svůj profil** - Kompletní přehled tvé postavy
```
📊 STATISTIKY
├─ Rasa a bonusy
├─ Level a XP progress bar
└─ Rank podle úrovně

💰 EKONOMIKA
├─ Hotovost v Kč
├─ Hodnota kovů
└─ Celkové bohatství

⛏️ INVENTÁŘ KOVŮ
├─ ⚙️ Železo (počet + hodnota)
├─ 🟠 Měď (počet + hodnota)
├─ 🟡 Zlato (počet + hodnota)
└─ 💎 Diamant (počet + hodnota)

🛠️ VYBAVENÍ
└─ Aktuální krumpáč

🎮 HERNÍ STATISTIKY
├─ Výhry / Prohry
└─ Win Rate %
```

### `/daily`
**Denní odměna** - Získej peníze každý den
- **500 Kč** denně zdarma
- Cooldown: **24 hodin**
- 💡 Nezapomeň si to vybrat každý den!

### `/leaderboard`
**Žebříček hráčů** - Top 10 nejbohatších
- Ukazuje jména, rasy a peníze
- Buď mezi nejlepšími!

---

## 🎭 Rasy & Bonusy

Při vytváření postavy si vyber jednu z 5 ras. **NELZE ZMĚNIT!**

| Rasa | Emoji | Bonus | Popis |
|------|-------|-------|-------|
| **Human** | 👤 | Žádný | Vyvážená rasa bez speciálních bonusů |
| **Elf** | 🧝 | +20% výdělek z `/work` | Perfektní pro pracovité hráče |
| **Mage** | 🧙 | +50% XP | Rychlejší levelování |
| **Warrior** | ⚔️ | +30% úspěšnost `/crime` | Lepší v zločinech (50%→80%) |
| **Thief** | 🗡️ | +20% úspěšnost `/rob` | Lepší v krádežích (60%→80%) |

---

## 💼 Výdělek

### `/work`
**Pracuj za peníze** - Stabilní příjem
- **50-300 Kč** za práci + XP
- **Cooldown: 1 minuta**
- 6 náhodných prací (kuchař, doktor, učitel...)
- 🧝 **Elf bonus:** +20% peněz
- 🧙 **Mage bonus:** +50% XP

### `/crime`
**Spáchej zločin** - Vysoké riziko, vysoká odměna
- **50% šance** na úspěch (základní)
- ✅ **Úspěch:** 500-2000 Kč + XP
- ❌ **Fail:** Pokuta 100-500 Kč
- ⚔️ **Warrior bonus:** 80% šance na úspěch

---

## 🎰 Hazardní hry

Všechny hry mají **animace** a sledují **výhry/prohry** statistiky!

### `/gamble amount:[Kč] type:[barva]`
**Evropská ruleta** - Kasino
- **Minimum:** 50 Kč
- 🔴 **Červená (2x):** čísla 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
- ⚫ **Černá (2x):** čísla 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35
- 🟢 **Zelená/0 (36x):** číslo 0
- 🎯 **Volitelně:** `number:[0-36]` pro sázku na konkrétní číslo (36x)

### `/slots bet:[Kč]`
**Slot machine** - Točící se automaty
- **Minimum:** 50 Kč
- 💎💎💎 = **50x** (Jackpot!)
- 7️⃣7️⃣7️⃣ = **20x** (Velká výhra!)
- 🍒🍒🍒 / 🍋🍋🍋 / ⭐⭐⭐ = **10x**
- Dva stejné = **2x**
- 🎬 **3-fázová animace** točení

### `/coinflip bet:[Kč] choice:[hlava/orel]`
**Hod mincí** - 50/50 šance
- **Minimum:** 100 Kč
- Vyber hlava nebo orel
- **Výhra = 2x** sázka
- 🎬 Animace hodu mince

### `/blackjack bet:[Kč]`
**Interaktivní Blackjack** - Karty proti dealerovi
- **Minimum:** 50 Kč
- 🃏 Dealer musí táhnout do 17
- 🔘 **Tlačítka:** Hit (táhni) / Stand (zastav)
- Cíl: Dostat se co nejblíž 21 bez překročení
- **Blackjack (21) = 2.5x** sázka!

### `/crash bet:[Kč]`
**Crash game** - Sleduj multiplier
- **Minimum:** 100 Kč
- 📈 Multiplier roste od 1.00x
- 💰 **Cash Out** včas nebo ztratíš vše
- Maximální multiplier: 10.00x
- ⏱️ Napínavá hra proti času

### `/dice bet:[Kč]`
**Hod kostkami** - Proti botovi
- **Minimum:** 100 Kč
- 🎲 Házíš 2 kostky (2-12)
- Bot také háže 2 kostky
- **Vyšší součet vyhrává**
- Remíza = vrácení sázky

---

## 🎭 PvP Systém

### `/rob @uživatel`
**Okradení hráče** - PvP akce
- **60% šance** na úspěch (základní)
- ✅ **Úspěch:** Ukradneš 10-40% peněz oběti
- ❌ **Fail:** Zaplatíš pokutu 20% tvých peněz
- 🗡️ **Thief bonus:** 80% šance na úspěch
- 🛡️ **Rob Protection** blokuje okradení

---

## 🏪 Obchod

### `/shop`
**Zobraz obchod** - Speciální upgrady

### `/shop item:work_boost`
**Work Boost** - Dvojnásobný výdělek
- **Cena:** 5000 Kč
- **Trvání:** 7 dní
- ⚡ **2x peníze** z `/work`

### `/shop item:rob_protection`
**Rob Protection** - Ochrana před krádeží
- **Cena:** 3000 Kč
- **Trvání:** 5 dní
- 🛡️ Nikdo tě nemůže okrást

---

## ⛏️ Mining & Upgrady

### 🛠️ Systém krumpáčů

Začínáš s **Dřevěným krumpáčem** a můžeš upgradovat na lepší!

| Krumpáč | Cena | Šance na rudy |
|---------|------|---------------|
| 🪵 **Dřevěný** | Výchozí | 80% Železo, 20% Měď |
| ⚙️ **Železný** | 5,000 Kč | 50% Železo, 30% Měď, 20% Zlato |
| 💎 **Diamantový** | 50,000 Kč | 30% Železo, 30% Měď, 30% Zlato, 10% Diamant |

### `/mine`
**Těž kovy** - Hlavní mining příkaz
- ⛏️ Animace těžby (2 sekundy)
- Drop závisí na tvém krumpáči
- Zobrazí tvůj inventář po vytěžení
- 💡 Tip: Upgraduj krumpáč pro lepší rudy!

### `/upgrade`
**Vylepši krumpáč** - Progrese
- Zobrazí aktuální krumpáč a statistiky
- Nabídne dostupný upgrade
- 🔘 **Tlačítko** pro okamžitý nákup
- Lepší krumpáč = lepší rudy!

### `/inventory`
**Zobraz kovy** - Tvůj sklad
```
📦 Tvůj inventář:
├─ ⚙️ Železo: X (50 Kč/ks)
├─ 🟠 Měď: X (100 Kč/ks)
├─ 🟡 Zlato: X (500 Kč/ks)
└─ 💎 Diamant: X (2000 Kč/ks)

💰 Celková hodnota: X Kč
```

### `/sell ore:[typ] amount:[počet]`
**Prodej kovy** - NPC obchod
- Prodej kovy za **fixní ceny**:
  - ⚙️ Železo: **50 Kč/ks**
  - 🟠 Měď: **100 Kč/ks**
  - 🟡 Zlato: **500 Kč/ks**
  - 💎 Diamant: **2000 Kč/ks**
- Okamžitá platba do peněženky

### `/auction create ore:[typ] amount:[počet] price:[cena/ks]`
**Vytvoř aukci** - Hráč vs hráč obchod
- Nastav **vlastní ceny**
- Kovy se odeberou z inventáře
- Ostatní hráči vidí tvou nabídku
- 💰 **Tlačítko "Koupit"** pro rychlý nákup

### `/auction list`
**Aktivní aukce** - Tržiště
- Seznam všech nabídek
- Vidíš: prodejce, množství, cenu
- Klikni na tlačítko pro nákup

---

## 👮 Admin příkazy

⚠️ **Pouze pro autorizované adminy!** (User ID: 1762720768539)

### `/admin check @user`
**Kontrola hráče** - Zobraz všechny statistiky
- Kompletní profil hráče
- Všechny peníze a kovy
- Statistiky her

### `/admin addmoney @user amount:[Kč]`
**Přidej peníze** - Reward hráče
- Přidá zadanou částku
- Pro odměny nebo eventy

### `/admin removemoney @user amount:[Kč] reason:[důvod]`
**Odeber peníze** - Pokuta
- Odebere částku
- Zadej důvod (zobrazí se hráči)

### `/admin setmoney @user amount:[Kč]`
**Nastav peníze** - Přesná částka
- Nastaví konkrétní hodnotu
- Přepíše současný stav

💡 **Přidání dalších adminů:** Edituj `ADMIN_USER_IDS` v `commands/admin.js`

---

## 📊 Progresní systém

### 🎖️ Levely a XP
- **100 XP = 1 Level**
- XP získáváš z:
  - `/work` - 5-15 XP
  - `/crime` - 10-30 XP
  - Hazardních her (výhry)
- 🧙 **Mage:** +50% XP bonus

### 👑 Ranky podle levelu

| Level | Rank | Emoji | Barva |
|-------|------|-------|-------|
| 1-4 | Nováček | 🥉 | Bronzová |
| 5-9 | Pokročilý | 🥈 | Stříbrná |
| 10-19 | Expert | 🥇 | Zlatá |
| 20-29 | Mistr | 💎 | Azurová |
| 30+ | Legenda | 👑 | Růžová |

### 📈 Win/Loss statistiky
- Každá hazardní hra se počítá
- Sleduj svůj **Win Rate %**
- Ukazuje se v `/profile`

---

## 💡 Tipy & Triky

### 💰 Jak rychle zbohatnout?
1. **Denní rutina:**
   - `/daily` každý den (500 Kč zdarma)
   - `/work` co nejčastěji (1 min cooldown)
   - `/mine` pro kovy

2. **Investice:**
   - Kup **Work Boost** (2x výdělek 7 dní)
   - Upgraduj krumpáč na **Železný** (lepší rudy)

3. **Risk/Reward:**
   - `/crime` pokud máš rezervu
   - `/rob` bohaté hráče (Thief = nejlepší)
   - Hazardní hry s rozumnou sázkou

### ⛏️ Mining strategie?
1. Začni s **Dřevěným** - nakop Železo/Měď
2. Prode j na `/sell` za 50-100 Kč/ks
3. Našetři **5,000 Kč** na Železný krumpáč
4. S Železným těž **Zlato** (500 Kč/ks)
5. Cíl: **50,000 Kč** na Diamantový krumpáč
6. S Diamantovým máš **10% šanci na Diamant** (2000 Kč/ks)!

### 🎭 Která rasa je nejlepší?
- **Elf** - pro AFK farming (`/work` každou minutu)
- **Mage** - pro rychlé levelování
- **Warrior** - pro risking (`/crime` farming)
- **Thief** - pro PvP (`/rob` ostatní hráče)
- **Human** - vyvážená pro všechno

---

## ⚙️ Technické info

### 🔧 Systém
- **Framework:** Discord.js v14
- **Database:** PostgreSQL (Railway)
- **Hosting:** Railway auto-deploy
- **Příkazy:** Slash commands only

### 🔒 Omezení
- Bot funguje pouze v kanálu: `1436692725838774343`
- Jeden účet = jedna postava
- Všechny peněžní transakce jsou atomické (bezpečné)

### 🐛 Našel jsi bug?
Kontaktuj admina: <@1762720768539>

---

## 📞 Podpora

**Admin:** <@1762720768539>
**Server:** DK RP
**Verze bota:** 2.0

---

> **Vytvořeno s ❤️ pro DK RP komunitu**
> *Poslední aktualizace: 9. listopadu 2025*

---

## 🎯 Quick Start Guide

**Nový hráč? Začni tady:**

1️⃣ `/create` - Vytvoř postavu (vyber rasu)
2️⃣ `/daily` - Vyber denní odměnu (500 Kč)
3️⃣ `/work` - Pracuj pro peníze
4️⃣ `/mine` - Vytěž první kovy
5️⃣ `/sell` - Prodej kovy za peníze
6️⃣ `/profile` - Zkontroluj progres
7️⃣ Užij si hry a staň se legendou! 🚀
