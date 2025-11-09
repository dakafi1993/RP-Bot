import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addMoney() {
  try {
    const userId = '1762720768539';
    
    console.log('Připojuji k databázi...');
    
    const checkResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Nemáš ještě postavu! Použij /create v Discordu.');
      process.exit(1);
    }
    
    const user = checkResult.rows[0];
    console.log(`Aktuální zůstatek: ${user.money} Kč`);
    
    const newMoney = user.money + 100000;
    await db.query('UPDATE users SET money = $1 WHERE id = $2', [newMoney, userId]);
    
    console.log(`✅ Přidáno 100,000 Kč!`);
    console.log(`Nový zůstatek: ${newMoney} Kč`);
    
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('Chyba:', error);
    process.exit(1);
  }
}

addMoney();
