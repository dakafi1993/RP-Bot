import pkg from 'pg';
const { Pool } = pkg;
import { config } from 'dotenv';

config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Oprava všech uživatelů s nesprávnou říší
async function fixRealmProgression() {
  try {
    console.log('🔧 Opravuji realm progression pro všechny uživatele...');

    const users = await db.query('SELECT id, level, realm FROM users');

    for (const user of users.rows) {
      let correctRealm = 'ancient';
      
      if (user.level >= 80) correctRealm = 'futuristic';
      else if (user.level >= 60) correctRealm = 'modern';
      else if (user.level >= 40) correctRealm = 'renaissance';
      else if (user.level >= 20) correctRealm = 'medieval';

      if (user.realm !== correctRealm) {
        await db.query('UPDATE users SET realm = $1 WHERE id = $2', [correctRealm, user.id]);
        console.log(`✅ User ${user.id}: Level ${user.level} | ${user.realm} → ${correctRealm}`);
      }
    }

    console.log('🎉 Realm progression opraven!');
    
  } catch (error) {
    console.error('❌ Chyba:', error);
  } finally {
    await db.end();
  }
}

fixRealmProgression();
