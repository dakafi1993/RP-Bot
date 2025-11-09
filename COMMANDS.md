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
- `/shop` - Hlavní menu obchodu
- `/shop category:[kategorie]` - Zobraz kategorii itemů
  - ⚔️ **Zbraně** - Meče (Dřevěný 1k, Železný 5k, Diamantový 25k)
  - 🛡️ **Brnění & Helmy** - Ochrana (Kožené, Železné, Diamantové)
  - 👟 **Boty** - Rychlost + obrana (600 Kč - 12k Kč)
  - 🧪 **Lektvary** - Health, Síla, Obrana (500-1000 Kč)
  - ⛏️ **Krumpáče** - Dřevěný krumpáč (500 Kč)
  - ✨ **Boosters** - Work Boost (5k), Rob Protection (3k)
- `/shop item:[klíč]` - Kup konkrétní item (např. iron_sword)

## ⚔️ RPG Systém
- `/equip slot:[slot] item:[klíč]` - Nasaď vybavení
  - Sloty: weapon, helmet, armor, boots, potion
- `/unequip slot:[slot]` - Sundej vybavení
- `/arena opponent:@user bet:[částka]` - PvP souboj mezi hráči
  - Sázka min 100 Kč
  - Vítěz bere vše (2x sázka)
  - Bojuje se s vybavenými zbraněmi/brněním
- `/expedition` - PvE výprava proti příšerám
  - Příšery podle říše (Goblin → Cyborg)
  - Odměna: Peníze + XP
  - Prohra: -10% peněz

## 🌍 Říše & Progrese
Hráči postupují říšemi podle levelu:
- 🏛️ **Starodávná** (Level 1-10) - Goblini, Vlci, Skeleton
- 🏰 **Středověká** (Level 11-20) - Rytíři, Draci, Trolli
- 🎨 **Renesanční** (Level 21-30) - Mušketýři, Alchymisté
- 🏙️ **Moderní** (Level 31-40) - Válečníci, Snipeři, Tanky
- 🚀 **Futuristická** (Level 41+) - Cyborgi, AI Roboti, Aliens

## ⛏️ Mining & Tržiště
- `/mine` - Těž kovy (závisí na krumpáči) **[Cooldown: 30 minut]**
  - 🪵 **Dřevěný krumpáč** (výchozí): 70% Železo, 25% Měď, 5% Diamant (rozbije se po použití)
  - ⚙️ **Železný krumpáč** (5000 Kč): 45% Železo, 30% Měď, 15% Zlato, 10% Diamant (durability 100%)
  - 💎 **Diamantový krumpáč** (50000 Kč): 25% Železo, 25% Měď, 30% Zlato, 20% Diamant (durability 100%)
- `/repair` - Oprav krumpáč (dřevěný nelze opravit)
  - ⚙️ Železný: 2000 Kč
  - 💎 Diamantový: 10000 Kč
- `/upgrade` - Vylepši krumpáč pro lepší rudy
- `/inventory` - Zobraz své kovy a celkovou hodnotu
- `/sell ore:[typ] amount:[počet]` - Prodej kovy do NPC shopu za fixní ceny
  - ⚙️ Železo: 50 Kč/ks
  - 🟠 Měď: 100 Kč/ks
  - 🟡 Zlato: 500 Kč/ks
  - 💎 Diamant: 2000 Kč/ks
- `/auction create ore:[typ] amount:[počet] price:[cena/ks]` - Vytvoř aukci pro hráče
- `/auction list` - Zobraz aktivní aukce hráčů
  - 💰 Tlačítko "Koupit" - Automatická transakce mezi hráči

## � Admin příkazy (User ID: 1436690629949263964)

### 💰 Správa peněz
- `/admin addmoney @user amount:[částka]` - Přidej peníze hráči (neomezeno)
- `/admin removemoney @user amount:[částka] reason:[důvod]` - Udělej pokutu za porušení pravidel
- `/admin setmoney @user amount:[částka]` - Nastav přesnou částku peněz

### ⭐ Správa XP & Vybavení
- `/admin addxp @user amount:[xp]` - Přidej XP hráči (automatický level up při 100+)
- `/admin setpickaxe @user pickaxe:[wooden/iron/diamond]` - Nastav krumpáč hráči
- `/admin addores @user iron:[x] copper:[x] gold:[x] diamond:[x]` - Přidej kovy do inventáře
- `/admin setrealm @user realm:[ancient/medieval/renaissance/modern/futuristic]` - Změň říši hráče

### � Kontrola
- `/admin check @user` - Zkontroluj profil hráče (vidí všechny statistiky + User ID)

## 🛡️ Moderátor příkazy (User ID: 1404534814857494708)

### Omezená oprávnění
- `/admin addmoney @user amount:[částka]` - Max 50,000 Kč
- `/admin removemoney @user amount:[částka] reason:[důvod]` - Nelze odebrat adminům
- `/admin check @user` - Kontrola profilu hráče

❌ **Nemůže:** setmoney, addxp, setpickaxe, addores

�💡 **Přidání dalších adminů/moderátorů:** Edituj `ADMIN_USER_IDS` / `MODERATOR_USER_IDS` v `commands/admin.js`

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
