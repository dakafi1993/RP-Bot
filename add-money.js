import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addMoneyToOwner() {
  try {
    // Tvoje Discord User ID
    const YOUR_USER_ID = '1436690629949263964';
    
    console.log('Připojuji k databázi...');
    
    // Kontrola existence
    const checkResult = await db.query('SELECT * FROM users WHERE id = $1', [YOUR_USER_ID]);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Nemáš ještě postavu! Použij /create v Discordu nejdřív.');
      process.exit(1);
    }
    
    const user = checkResult.rows[0];
    console.log(`Aktuální zůstatek: ${user.money} Kč`);
    
    // Přidání 100,000 Kč
    const newMoney = user.money + 100000;
    await db.query('UPDATE users SET money = $1 WHERE id = $2', [newMoney, YOUR_USER_ID]);
    
    console.log(`✅ Přidáno 100,000 Kč!`);
    console.log(`Nový zůstatek: ${newMoney} Kč`);
    
    process.exit(0);
  } catch (error) {
    console.error('Chyba:', error);
    process.exit(1);
  }
}

addMoneyToOwner();
