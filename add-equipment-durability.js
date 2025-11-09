import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';

config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addEquipmentDurability() {
  try {
    console.log('🔧 Přidávám durability sloupce pro vybavení...');

    // Weapon durability
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS weapon_durability INTEGER DEFAULT 100
    `);
    console.log('✅ weapon_durability přidán');

    // Helmet durability
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS helmet_durability INTEGER DEFAULT 100
    `);
    console.log('✅ helmet_durability přidán');

    // Armor durability
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS armor_durability INTEGER DEFAULT 100
    `);
    console.log('✅ armor_durability přidán');

    // Boots durability
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS boots_durability INTEGER DEFAULT 100
    `);
    console.log('✅ boots_durability přidán');

    // HP pro regeneraci
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS current_hp INTEGER DEFAULT 100
    `);
    console.log('✅ current_hp přidán');

    console.log('🎉 Všechny durability sloupce úspěšně přidány!');
    
  } catch (error) {
    console.error('❌ Chyba při přidávání sloupců:', error);
  } finally {
    await db.end();
  }
}

addEquipmentDurability();
