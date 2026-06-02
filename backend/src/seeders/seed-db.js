const { Client } = require('pg');
const argon2 = require('argon2');
const { v4: uuid } = require('uuid');

const DB_URL = 'postgresql://electronix_db_user:rqVKKzcOUvG3orMNhGrRk1bWybc7BEnQ@dpg-d8fadc19rddc73cgeplg-a.ohio-postgres.render.com/electronix_db';

const SELLERS = [
  { email: 'ahmed@example.com', username: 'ahmedtech', displayName: 'Ahmed Hassan', location: 'Cairo, Egypt' },
  { email: 'sarah@example.com', username: 'sarahgadgets', displayName: 'Sarah Mohamed', location: 'Dubai, UAE' },
  { email: 'omar@example.com', username: 'omarstore', displayName: 'Omar Ali', location: 'Istanbul, Turkey' },
];
const BUYERS = [
  { email: 'layla@example.com', username: 'laylax', displayName: 'Layla Ahmed' },
  { email: 'khaled@example.com', username: 'khaled99', displayName: 'Khaled Mostafa' },
];

const LISTINGS = [
  { t: 'iPhone 16 Pro Max 256GB Titanium', d: 'Brand new iPhone 16 Pro Max, Deep Purple, 256GB storage. A18 Pro chip, 48MP camera system.', p: 1299, op: 1499, b: 'Apple', m: 'iPhone 16 Pro Max', c: 'new', cat: 'mobile-phones', col: 'Deep Purple', s: '256GB', l: 'Cairo', co: 'Egypt' },
  { t: 'Samsung Galaxy S25 Ultra 512GB', d: 'Samsung Galaxy S25 Ultra Titanium Gray. 512GB, S-Pen, 200MP camera. Like new.', p: 1099, op: 1399, b: 'Samsung', m: 'Galaxy S25 Ultra', c: 'like_new', cat: 'mobile-phones', col: 'Titanium Gray', s: '512GB', l: 'Dubai', co: 'UAE' },
  { t: 'MacBook Pro 16 M4 Max 64GB RAM', d: 'Apple MacBook Pro 16-inch M4 Max, 64GB RAM, 2TB SSD. Space Black.', p: 3499, op: 3999, b: 'Apple', m: 'MacBook Pro 16 M4 Max', c: 'new', cat: 'laptops', col: 'Space Black', s: '2TB', l: 'Istanbul', co: 'Turkey' },
  { t: 'PlayStation 5 Pro Digital Edition', d: 'PS5 Pro 2TB SSD. DualSense controller. Like new.', p: 699, op: 799, b: 'Sony', m: 'PS5 Pro', c: 'excellent', cat: 'gaming-consoles', col: 'White', s: '2TB', l: 'Cairo', co: 'Egypt' },
  { t: 'Samsung Galaxy Watch 7 Pro', d: 'Samsung Galaxy Watch 7 Pro LTE, Titanium. ECG, blood pressure.', p: 399, op: 499, b: 'Samsung', m: 'Galaxy Watch 7 Pro', c: 'excellent', cat: 'smart-watches', col: 'Titanium', s: '32GB', l: 'Dubai', co: 'UAE' },
  { t: 'iPad Pro 13 M4 256GB WiFi', d: 'iPad Pro 13-inch M4, 256GB, WiFi+Cell. Silver. With Pencil Pro.', p: 1299, op: 1599, b: 'Apple', m: 'iPad Pro 13 M4', c: 'like_new', cat: 'tablets', col: 'Silver', s: '256GB', l: 'Cairo', co: 'Egypt' },
  { t: 'Dell XPS 16 Intel Ultra 9 32GB', d: 'Dell XPS 16, Intel Core Ultra 9, 32GB, 1TB SSD, RTX 4070.', p: 2199, op: 2599, b: 'Dell', m: 'XPS 16', c: 'new', cat: 'laptops', col: 'Platinum Silver', s: '1TB', l: 'Istanbul', co: 'Turkey' },
  { t: 'iPhone 15 Pro Max 512GB Natural Titanium', d: 'iPhone 15 Pro Max 512GB. 90% battery health. With box.', p: 899, op: 1199, b: 'Apple', m: 'iPhone 15 Pro Max', c: 'excellent', cat: 'mobile-phones', col: 'Natural Titanium', s: '512GB', l: 'Cairo', co: 'Egypt' },
  { t: 'Samsung Galaxy Book 4 Ultra i9', d: 'Galaxy Book 4 Ultra i9, 32GB, 1TB, RTX 4070. 16-inch 3K AMOLED.', p: 2399, op: 2899, b: 'Samsung', m: 'Galaxy Book 4 Ultra', c: 'new', cat: 'laptops', col: 'Moonstone Gray', s: '1TB', l: 'Dubai', co: 'UAE' },
  { t: 'Sony WH-1000XM6 Wireless Headphones', d: 'Sony WH-1000XM6 noise canceling. Black, 40h battery.', p: 329, op: 399, b: 'Sony', m: 'WH-1000XM6', c: 'like_new', cat: 'accessories', col: 'Black', s: '', l: 'Dubai', co: 'UAE' },
  { t: 'Xbox Series X 2TB Galaxy Black', d: 'Xbox Series X 2TB Special Edition. 2 controllers + Game Pass.', p: 599, op: 699, b: 'Microsoft', m: 'Xbox Series X', c: 'new', cat: 'gaming-consoles', col: 'Galaxy Black', s: '2TB', l: 'Cairo', co: 'Egypt' },
  { t: 'Apple Watch Ultra 3 Titanium', d: 'Apple Watch Ultra 3 Titanium, Alpine Loop. GPS+Cellular.', p: 799, op: 899, b: 'Apple', m: 'Watch Ultra 3', c: 'new', cat: 'smart-watches', col: 'Natural Titanium', s: '64GB', l: 'Istanbul', co: 'Turkey' },
  { t: 'Asus ROG Zephyrus G16 i9 RTX 4080', d: 'Asus ROG Zephyrus G16, i9, 32GB DDR5, 1TB, RTX 4080, QHD 240Hz.', p: 2599, op: 2999, b: 'Asus', m: 'ROG Zephyrus G16', c: 'excellent', cat: 'laptops', col: 'Eclipse Gray', s: '1TB', l: 'Cairo', co: 'Egypt' },
  { t: 'Google Pixel 9 Pro Fold 256GB', d: 'Google Pixel 9 Pro Fold, Porcelain, 256GB. Tensor G4.', p: 1399, op: 1799, b: 'Google', m: 'Pixel 9 Pro Fold', c: 'like_new', cat: 'mobile-phones', col: 'Porcelain', s: '256GB', l: 'Dubai', co: 'UAE' },
  { t: 'Nintendo Switch 2 OLED Mario Edition', d: 'Nintendo Switch 2 OLED Mario Edition. 512GB, OLED screen.', p: 449, op: 499, b: 'Nintendo', m: 'Switch 2 OLED', c: 'new', cat: 'gaming-consoles', col: 'Red/Blue', s: '512GB', l: 'Istanbul', co: 'Turkey' },
  { t: 'Lenovo ThinkPad X1 Carbon Gen 12', d: 'ThinkPad X1 Carbon Gen 12, Ultra 7, 16GB, 512GB, 2.8K OLED.', p: 1899, op: 2299, b: 'Lenovo', m: 'ThinkPad X1 Carbon Gen 12', c: 'new', cat: 'laptops', col: 'Black', s: '512GB', l: 'Cairo', co: 'Egypt' },
  { t: 'AirPods Pro 3 with USB-C', d: 'Apple AirPods Pro 3 USB-C. ANC, Adaptive Audio. Brand new.', p: 249, op: 279, b: 'Apple', m: 'AirPods Pro 3', c: 'new', cat: 'accessories', col: 'White', s: '', l: 'Dubai', co: 'UAE' },
  { t: 'Canon EOS R5 Mark II Mirrorless', d: 'Canon EOS R5 Mark II + 24-105mm f/4L kit. 45MP, 8K video.', p: 3899, op: 4499, b: 'Canon', m: 'EOS R5 Mark II', c: 'like_new', cat: 'cameras', col: 'Black', s: '', l: 'Cairo', co: 'Egypt' },
  { t: 'OnePlus 13 512GB Emerald Green', d: 'OnePlus 13, Emerald Green, 512GB, 16GB. Snapdragon 8 Elite.', p: 799, op: 899, b: 'OnePlus', m: '13', c: 'new', cat: 'mobile-phones', col: 'Emerald Green', s: '512GB', l: 'Dubai', co: 'UAE' },
  { t: 'HP Spectre x360 16 2-in-1', d: 'HP Spectre x360 16, Ultra 9, 32GB, 1TB. 4K OLED touch.', p: 1799, op: 2099, b: 'HP', m: 'Spectre x360 16', c: 'excellent', cat: 'laptops', col: 'Nightfall Black', s: '1TB', l: 'Istanbul', co: 'Turkey' },
  { t: 'Nothing Phone 3 256GB White', d: 'Nothing Phone 3 transparent, 50MP, Snapdragon 8 Gen 3.', p: 599, op: 699, b: 'Nothing', m: 'Phone 3', c: 'new', cat: 'mobile-phones', col: 'White', s: '256GB', l: 'Cairo', co: 'Egypt' },
  { t: 'Samsung Galaxy Tab S10 Ultra 512GB', d: 'Samsung Galaxy Tab S10 Ultra 14.6-inch, 512GB, 16GB. S-Pen.', p: 1199, op: 1399, b: 'Samsung', m: 'Galaxy Tab S10 Ultra', c: 'like_new', cat: 'tablets', col: 'Graphite', s: '512GB', l: 'Dubai', co: 'UAE' },
];

const REVIEWS = [
  [5, 'Amazing seller! Device exactly as described, fast shipping.'],
  [4, 'Good product, perfect condition. Would buy again.'],
  [5, 'Perfect condition, packed very well. Highly recommended!'],
  [3, 'Decent product, shipping took longer than expected.'],
  [5, 'Excellent communication, item is flawless. Great seller!'],
  [4, 'Great deal for the price. Device works perfectly.'],
  [5, 'Fast delivery and genuine product. Very satisfied.'],
  [4, 'Seller was helpful with questions. Item as described.'],
];

async function seed() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected');

  const r = await client.query(`SELECT id FROM "users" WHERE email = 'admin@electronix.com'`);
  if (r.rows.length > 0) {
    console.log('Already seeded. Run reset first.');
    await client.end();
    return;
  }

  const adminHash = await argon2.hash('Admin123!');
  const userHash = await argon2.hash('Test1234!');
  console.log('Hashed');

  const adminId = uuid();
  await client.query(
    `INSERT INTO "users"("id","email","passwordHash","username","displayName","role","status","isEmailVerified","isSeller","sellerLevel","trustScore","location","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`,
    [adminId, 'admin@electronix.com', adminHash, 'admin', 'Admin', 'super_admin', 'active', true, true, 'diamond', 100, 'Cairo, Egypt']
  );
  console.log('Admin done');

  const sellerIds = [];
  for (const s of SELLERS) {
    const id = uuid();
    sellerIds.push(id);
    await client.query(
      `INSERT INTO "users"("id","email","passwordHash","username","displayName","role","status","isEmailVerified","isSeller","sellerLevel","trustScore","location","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`,
      [id, s.email, userHash, s.username, s.displayName, 'user', 'active', true, true, 'gold', 85, s.location]
    );
  }
  console.log('Sellers done');

  const buyerIds = [];
  for (const b of BUYERS) {
    const id = uuid();
    buyerIds.push(id);
    await client.query(
      `INSERT INTO "users"("id","email","passwordHash","username","displayName","role","status","isEmailVerified","isSeller","trustScore","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
      [id, b.email, userHash, b.username, b.displayName, 'user', 'active', true, false, 50]
    );
  }
  console.log('Buyers done');

  const listingIds = [];
  for (let i = 0; i < LISTINGS.length; i++) {
    const x = LISTINGS[i];
    const id = uuid();
    listingIds.push(id);
    const sellerId = sellerIds[i % sellerIds.length];
    const images = JSON.stringify([{ url: 'https://picsum.photos/seed/' + id + '/640/480', isPrimary: true }]);
    const tags = JSON.stringify([x.b, x.m, x.c]);
    const slug = x.t.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + id.substring(0, 8);
    const seoData = JSON.stringify({ slug, metaTitle: x.t, metaDescription: x.d.substring(0, 160) });
    const spec = JSON.stringify({ color: x.col || '', storage: x.s || '' });
    const now = new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000);

    await client.query(
      `INSERT INTO "listings"("id","title","description","price","originalPrice","listingType","condition","brand","model","color","storageCapacity","images","location","country","status","sellerId","viewCount","seoData","specifications","tags","categoryId","isFraudChecked","fraudRiskScore","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
      [id, x.t, x.d, x.p, x.op || null, 'fixed', x.c, x.b, x.m, x.col || null, x.s || null, images, x.l, x.co, 'active', sellerId, Math.floor(Math.random() * 500) + 10, seoData, spec, tags, x.cat, true, 0, now, now]
    );
  }
  console.log(LISTINGS.length + ' listings done');

  for (let i = 0; i < Math.min(15, listingIds.length); i++) {
    const listingId = listingIds[i];
    const rr = await client.query('SELECT "sellerId" FROM "listings" WHERE "id"=$1', [listingId]);
    const sellerId = rr.rows[0]?.sellerId;
    if (!sellerId) continue;
    const [rating, text] = REVIEWS[i % REVIEWS.length];
    await client.query(
      `INSERT INTO "reviews"("id","rating","content","authorId","sellerId","listingId","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
      [uuid(), rating, text, buyerIds[i % buyerIds.length], sellerId, listingId]
    );
  }
  console.log('Reviews done');

  await client.end();
  console.log('\n===== DONE =====');
  console.log('Admin: admin@electronix.com / Admin123!');
  console.log('Sellers: ' + SELLERS.map(s => s.email).join(', ') + ' / Test1234!');
  console.log('Buyers: ' + BUYERS.map(b => b.email).join(', ') + ' / Test1234!');
  console.log('Listings: ' + LISTINGS.length);
}

seed().catch(err => { console.error(err); process.exit(1); });
