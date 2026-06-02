const { Client } = require('pg');
const DB_URL = 'postgresql://electronix_db_user:rqVKKzcOUvG3orMNhGrRk1bWybc7BEnQ@dpg-d8fadc19rddc73cgeplg-a.ohio-postgres.render.com/electronix_db';

async function reset() {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  for (const table of ['reviews', 'wishlist', 'listings', 'audit_log', 'users']) {
    try { await c.query(`DELETE FROM "${table}"`); } catch (e) { console.log('Skipping ' + table + ': ' + e.message); }
  }
  console.log('All data cleared');
  await c.end();
}
reset().catch(console.error);
