// Helper pro konverzi SQLite na PostgreSQL query
export function convertQuery(sqliteQuery, params = []) {
  // Převede ? na $1, $2, atd.
  let index = 0;
  const pgQuery = sqliteQuery.replace(/\?/g, () => {
    index++;
    return `$${index}`;
  });
  return { text: pgQuery, values: params };
}

// Wrapper pro SELECT queries
export async function get(db, query, params) {
  const result = await db.query(convertQuery(query, params).text, params);
  return result.rows[0] || null;
}

// Wrapper pro SELECT ALL queries
export async function all(db, query, params) {
  const result = await db.query(convertQuery(query, params).text, params);
  return result.rows;
}

// Wrapper pro INSERT/UPDATE/DELETE queries
export async function run(db, query, params) {
  const result = await db.query(convertQuery(query, params).text, params);
  return result;
}
