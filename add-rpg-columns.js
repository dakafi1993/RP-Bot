import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';

config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addNewColumns() {
  try {
    console.log('🔧 Přidávám nové sloupce do databáze...');

    // Mining cooldown
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_mine BIGINT DEFAULT 0
    `);
    console.log('✅ last_mine přidán');

    // Pickaxe durability (trvanlivost)
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS pickaxe_durability INTEGER DEFAULT 100
    `);
    console.log('✅ pickaxe_durability přidán');

    // Vybavení sloty
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS weapon TEXT DEFAULT NULL
    `);
    console.log('✅ weapon přidán');

    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS helmet TEXT DEFAULT NULL
    `);
    console.log('✅ helmet přidán');

    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS armor TEXT DEFAULT NULL
    `);
    console.log('✅ armor přidán');

    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS boots TEXT DEFAULT NULL
    `);
    console.log('✅ boots přidán');

    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS potion TEXT DEFAULT NULL
    `);
    console.log('✅ potion přidán');

    // Říše systém
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS realm TEXT DEFAULT 'ancient'
    `);
    console.log('✅ realm přidán');

    // Století
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS century INTEGER DEFAULT 1
    `);
    console.log('✅ century přidán');

    console.log('🎉 Všechny sloupce úspěšně přidány!');
    
  } catch (error) {
    console.error('❌ Chyba při přidávání sloupců:', error);
  } finally {
    await db.end();
  }
}

addNewColumns();
