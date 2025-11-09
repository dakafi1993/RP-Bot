# 📋 Všechny příkazy RP Bota

## 💰 Ekonomika
- `/create` - Vytvoř si postavu (jen jednou) - vyber jméno a rasu!
- `/profile` - Zobraz svůj profil (peníze, XP, level, statistiky, rasa)
- `/daily` - Denní odměna 500 Kč (jednou za 24h)
- `/leaderboard` - Top 10 nejlepších hráčů

## 🎭 Rasy & Bonusy
Při vytváření postavy vyber rasu:
- 👤 **Human** - Vyvážená rasa bez bonusů
- 🧝 **Elf** - +20% výdělek z `/work`
- 🧙 **Mage** - +50% XP ze všech aktivit
- ⚔️ **Warrior** - +30% úspěšnost u `/crime`
- 🗡️ **Thief** - +20% úspěšnost u `/rob` (60% → 80%)

## 💼 Výdělek
- `/work` - Pracuj za peníze (50-300 Kč + XP) **[Cooldown: 1 minuta]**
  - 🧝 Elf: +20% bonus na výdělek
  - 🧙 Mage: +50% XP bonus
- `/crime` - Spáchej zločin (vysoké riziko/odměna)
  - ⚔️ Warrior: +30% na úspěšnost (50% → 80%)

## 🎰 Hazardní hry (Animované)
- `/gamble amount:[částka] type:[barva]` - Ruleta v kasinu (min 50 Kč)
  - 🔴 Červená (2x) - čísla 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
  - ⚫ Černá (2x) - čísla 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35
  - 🟢 Zelená/0 (36x)
  - 🎯 Volitelně: `number:[0-36]` - sázka na konkrétní číslo (36x)

- `/slots bet:[částka]` - Slot machine s animací (min 50 Kč)
  - 💎💎💎 = 50x jackpot
  - 7️⃣7️⃣7️⃣ = 20x jackpot
  - Tři stejné = 10x
  - Dva stejné = 2x

- `/coinflip bet:[částka] choice:[hlava/orel]` - Hoď mincí (min 100 Kč)
  - 50/50 šance
  - Výhra = 2x

- `/blackjack bet:[částka]` - Interaktivní blackjack (min 50 Kč)
  - Tlačítka Hit/Stand
  - Dealer musí táhnout do 17

- `/crash bet:[částka]` - Crash game (min 100 Kč)
  - Sleduj rostoucí multiplier
  - Cash out včas než spadne!

- `/dice bet:[částka]` - Hoď kostkami proti botovi (min 100 Kč)
  - Vyšší součet vyhrává

## 🎭 PvP
- `/rob @uživatel` - Pokus okrást jiného hráče
  - 60% základní úspěšnost → ukradneš 10-40% peněz
  - 40% fail → pokuta 20% tvých peněz
  - 🗡️ Thief: +20% úspěšnost (60% → 80%)
  - 🛡️ Rob Protection blokuje okradení

## 🏪 Obchod
- `/shop` - Zobraz obchod
- `/shop item:work_boost` - 2x výdělek z /work (7 dní) - 5000 Kč
- `/shop item:rob_protection` - Ochrana před /rob (5 dní) - 3000 Kč

## 👮 Admin příkazy (User ID: 1762720768539)
- `/admin check @user` - Zkontroluj profil hráče (vidí všechny statistiky)
- `/admin addmoney @user amount:[částka]` - Přidej peníze hráči
- `/admin removemoney @user amount:[částka] reason:[důvod]` - Udělej pokutu za porušení pravidel
- `/admin setmoney @user amount:[částka]` - Nastav přesnou částku peněz

💡 **Přidání dalších adminů:** Edituj `ADMIN_USER_IDS` v `commands/admin.js`

## 📊 Statistiky
- **XP systém**: 100 XP = Level up
- **Win/Loss**: Sleduje výhry a prohry v hrách
- **Ranky**: Nováček → Pokročilý → Expert → Mistr → Legenda

## 🎯 Animace
- **Slots**: Točení válců (3 fáze)
- **Coinflip**: Animace hodu mince
- **Crash**: Live multiplier s tlačítkem Cash Out
- **Dice**: Vizuální kostky
- **Blackjack**: Interaktivní karty s tlačítky
