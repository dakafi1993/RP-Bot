// PostgreSQL Migration Script
// Tento skript převede všechny SQLite db.prepare() na PostgreSQL db.query()

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const commandsDir = './commands';
const files = readdirSync(commandsDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const filePath = join(commandsDir, file);
  let content = readFileSync(filePath, 'utf8');
  
  // Převod SELECT queries
  content = content.replace(
    /const (\w+) = db\.prepare\('SELECT \* FROM users WHERE id = \?'\)\.get\((\w+)\);/g,
    'const result_$1 = await db.query(\'SELECT * FROM users WHERE id = $1\', [$2]);\n      const $1 = result_$1.rows[0];'
  );
  
  // Převod UPDATE queries s .run()
  content = content.replace(
    /db\.prepare\('UPDATE users SET (.+?) WHERE id = \?'\)\.run\(([^)]+)\);/g,
    (match, setClause, params) => {
      const paramsList = params.split(',').map(p => p.trim());
      const placeholders = paramsList.map((_, i) => `$${i + 1}`).join(', ');
      return `await db.query('UPDATE users SET ${setClause.replace(/\?/g, () => placeholders.split(', ').shift())} WHERE id = $${paramsList.length}', [${params}]);`;
    }
  );
  
  // Převod leaderboard query
  content = content.replace(
    /const (\w+) = db\.prepare\(`\s*SELECT (.+?) FROM users (.+?)`\)\.all\(\);/gs,
    'const result_$1 = await db.query(`SELECT $2 FROM users $3`);\n      const $1 = result_$1.rows;'
  );
  
  writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Migrated: ${file}`);
}

console.log('\n🎉 Migration complete!');
