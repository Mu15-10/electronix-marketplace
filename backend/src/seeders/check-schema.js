const { Client } = require('pg');
const DB_URL = 'postgresql://electronix_db_user:rqVKKzcOUvG3orMNhGrRk1bWybc7BEnQ@dpg-d8fadc19rddc73cgeplg-a.ohio-postgres.render.com/electronix_db';

async function check() {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const tables = ['users', 'listings', 'reviews', 'audit_log'];
  for (const t of tables) {
    try {
      const r = await c.query(
        `SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`,
        [t]
      );
      console.log(`\n=== ${t} (${r.rows.length} columns) ===`);
      console.log(r.rows.map(x => `  ${x.column_name} (${x.data_type})${x.is_nullable === 'YES' ? ' NULL' : ' NOT NULL'}${x.column_default ? ' DEFAULT ' + x.column_default : ''}`).join('\n'));
    } catch (e) {
      console.log(`\n=== ${t} === NOT FOUND`);
    }
  }

  await c.end();
}
check().catch(console.error);
