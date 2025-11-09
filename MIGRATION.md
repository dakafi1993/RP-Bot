# Migrace na PostgreSQL

## V Railway přidej PostgreSQL databázi:
1. V Railway projektu → **New** → **Database** → **Add PostgreSQL**
2. Po vytvoření zkopíruj **DATABASE_URL**
3. Přidej do **Variables**: `DATABASE_URL=postgresql://...`

## Databáze se automaticky uloží trvale!

**Změny:**
- SQLite → PostgreSQL (trvalé uložení)
- `/create` nyní vyžaduje jméno a rasu
- Rasové bonusy aktivní

**Rasy:**
- 👤 Člověk - standardní
- 🧝 Elf - +20% výdělek z /work  
- 🧙 Mág - +50% XP
- ⚔️ Válečník - +30% šance v /crime
- 🦹 Zloděj - +20% šance v /rob
