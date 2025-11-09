import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';

config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addDiamondCooldown() {
  try {
    console.log('💎 Přidávám last_diamond_mine sloupec...');

    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_diamond_mine BIGINT DEFAULT 0
    `);
    
    console.log('✅ last_diamond_mine sloupec přidán!');
    
  } catch (error) {
    console.error('❌ Chyba:', error);
  } finally {
    await db.end();
  }
}

addDiamondCooldown();
