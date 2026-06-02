const { Client } = require('pg');
const DB_URL = 'postgresql://electronix_db_user:rqVKKzcOUvG3orMNhGrRk1bWybc7BEnQ@dpg-d8fadc19rddc73cgeplg-a.ohio-postgres.render.com/electronix_db';

async function run() {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();
  const lis = await c.query('SELECT COUNT(*) as cnt FROM listings');
  console.log('Listings: ' + lis.rows[0].cnt);
  const cat = await c.query('SELECT categoryId, COUNT(*) as cnt FROM listings GROUP BY categoryId ORDER BY cnt DESC');
  console.log('\nBy category:');
  cat.rows.forEach(x => console.log('  ' + x.categoryid + ': ' + x.cnt));
  const rev = await c.query('SELECT COUNT(*) as cnt FROM reviews');
  console.log('\nReviews: ' + rev.rows[0].cnt);
  const usr = await c.query('SELECT COUNT(*) as cnt FROM users');
  console.log('Users: ' + usr.rows[0].cnt);
  const top = await c.query('SELECT title, price, brand, model FROM listings ORDER BY price DESC LIMIT 5');
  console.log('\nTop 5 most expensive:');
  top.rows.forEach((x,i) => console.log((i+1) + '. ' + x.title + ' - $' + x.price));
  const cheap = await c.query('SELECT title, price, brand, model FROM listings ORDER BY price ASC LIMIT 5');
  console.log('\nTop 5 cheapest:');
  cheap.rows.forEach((x,i) => console.log((i+1) + '. ' + x.title + ' - $' + x.price));
  await c.end();
}
run().catch(console.error);
