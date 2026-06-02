const { Client } = require('pg');
const DB_URL = 'postgresql://electronix_db_user:rqVKKzcOUvG3orMNhGrRk1bWybc7BEnQ@dpg-d8fadc19rddc73cgeplg-a.ohio-postgres.render.com/electronix_db';

async function run() {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const r = await c.query('SELECT title, price, condition, brand, model FROM listings ORDER BY price DESC');
  r.rows.forEach((x, i) => console.log((i+1) + '. ' + x.title + ' - $' + x.price + ' - ' + x.brand + ' - ' + x.condition));
  const u = await c.query('SELECT email, role FROM users ORDER BY role ASC');
  console.log('\n--- USERS ---');
  u.rows.forEach(x => console.log(x.email + ' (' + x.role + ')'));
  const rev = await c.query('SELECT COUNT(*) as cnt FROM reviews');
  console.log('\n--- REVIEWS: ' + rev.rows[0].cnt + ' ---');
  await c.end();
}
run().catch(console.error);
