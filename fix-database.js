import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';

config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixDatabase() {
  try {
    console.log('Checking database columns...');
    
    // Přidání sloupců pokud neexistují
    await db.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS iron INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS copper INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS gold INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS diamond INTEGER DEFAULT 0
    `);
    
    console.log('✅ Database columns added/verified!');
    
    // Kontrola struktury
    const result = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    console.log('\n📊 Current table structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDatabase();
