const { Client } = require('pg');
const DB_URL = 'postgresql://electronix_db_user:rqVKKzcOUvG3orMNhGrRk1bWybc7BEnQ@dpg-d8fadc19rddc73cgeplg-a.ohio-postgres.render.com/electronix_db';
const { v4: uuid } = require('uuid');

async function testInsert() {
  const c = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await c.connect();

  const id = uuid();
  const cols = ['id','title','description','price','originalPrice','listingType','condition','brand','model','color','storageCapacity','images','location','country','status','sellerId','viewCount','seoData','specifications','tags','categoryId','isFraudChecked','fraudRiskScore','createdAt','updatedAt'];
  const vals = [id, 'Test', 'Test desc', 100, null, 'fixed', 'new', 'Apple', 'iPhone', 'Black', '128GB', '[]', 'Cairo', 'Egypt', 'active', id, 0, '{}', '{}', '[]', 'mobile-phones', true, 0, new Date(), new Date()];
  const placeholders = vals.map((_, i) => '$' + (i + 1)).join(',');
  
  console.log('Columns (' + cols.length + '):', cols.join(','));
  console.log('Placeholders (' + vals.length + '):', placeholders);

  try {
    await c.query(`INSERT INTO "listings" (${cols.map(x=>'"'+x+'"').join(',')}) VALUES (${placeholders})`, vals);
    console.log('INSERT OK');
  } catch (err) {
    console.log('ERROR:', err.message);
  }

  await c.end();
}
testInsert().catch(console.error);
