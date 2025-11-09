import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';

config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixWorkColumn() {
  try {
    console.log('🔧 Přidávám sloupec last_work do databáze...');
    
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_work BIGINT DEFAULT 0
    `);
    
    console.log('✅ Sloupec last_work úspěšně přidán!');
    
    // Kontrola struktury
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'last_work'
    `);
    
    if (result.rows.length > 0) {
      console.log('\n📊 Sloupec last_work existuje:');
      console.log(`  - ${result.rows[0].column_name}: ${result.rows[0].data_type}`);
    }
    
    await db.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await db.end();
    process.exit(1);
  }
}

fixWorkColumn();
