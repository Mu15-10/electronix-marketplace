import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as argon2 from 'argon2';
import { v4 as uuid } from 'uuid';

const SELLERS = [
  { email: 'ahmed@example.com', username: 'ahmedtech', displayName: 'Ahmed Hassan', city: 'Cairo', country: 'Egypt' },
  { email: 'sarah@example.com', username: 'sarahgadgets', displayName: 'Sarah Mohamed', city: 'Dubai', country: 'UAE' },
  { email: 'omar@example.com', username: 'omarstore', displayName: 'Omar Ali', city: 'Istanbul', country: 'Turkey' },
];

const BUYERS = [
  { email: 'layla@example.com', username: 'laylax', displayName: 'Layla Ahmed' },
  { email: 'khaled@example.com', username: 'khaled99', displayName: 'Khaled Mostafa' },
];

const LISTINGS_DATA = [
  { title: 'iPhone 16 Pro Max 256GB Titanium', description: 'Brand new iPhone 16 Pro Max, Deep Purple, 256GB storage. A18 Pro chip, 48MP camera system. Full box with accessories.', price: 1299, originalPrice: 1499, brand: 'Apple', model: 'iPhone 16 Pro Max', condition: 'new', categoryId: 'mobile-phones', color: 'Deep Purple', storageCapacity: '256GB', location: 'Cairo', country: 'Egypt', isFeatured: true },
  { title: 'Samsung Galaxy S25 Ultra 512GB', description: 'Samsung Galaxy S25 Ultra in Titanium Gray. 512GB storage, S-Pen included, 200MP camera. Like new condition, used for 2 weeks.', price: 1099, originalPrice: 1399, brand: 'Samsung', model: 'Galaxy S25 Ultra', condition: 'like_new', categoryId: 'mobile-phones', color: 'Titanium Gray', storageCapacity: '512GB', location: 'Dubai', country: 'UAE', isFeatured: true },
  { title: 'MacBook Pro 16 M4 Max 64GB RAM', description: 'Apple MacBook Pro 16-inch with M4 Max chip, 64GB unified memory, 2TB SSD. Space Black. Includes MagSafe charger and USB-C cable.', price: 3499, originalPrice: 3999, brand: 'Apple', model: 'MacBook Pro 16 M4 Max', condition: 'new', categoryId: 'laptops', color: 'Space Black', storageCapacity: '2TB', location: 'Istanbul', country: 'Turkey', isFeatured: true },
  { title: 'PlayStation 5 Pro Digital Edition', description: 'PS5 Pro with 2TB SSD. DualSense controller included. Like new, barely used. Comes with original box and all cables.', price: 699, originalPrice: 799, brand: 'Sony', model: 'PS5 Pro', condition: 'excellent', categoryId: 'gaming-consoles', color: 'White', storageCapacity: '2TB', location: 'Cairo', country: 'Egypt', isFeatured: true },
  { title: 'Samsung Galaxy Watch 7 Pro', description: 'Samsung Galaxy Watch 7 Pro LTE, Titanium case. Excellent condition with all original accessories. ECG, blood pressure monitoring.', price: 399, originalPrice: 499, brand: 'Samsung', model: 'Galaxy Watch 7 Pro', condition: 'excellent', categoryId: 'smart-watches', color: 'Titanium', storageCapacity: '32GB', location: 'Dubai', country: 'UAE', isFeatured: true },
  { title: 'iPad Pro 13 M4 256GB WiFi', description: 'iPad Pro 13-inch with M4 chip, 256GB storage, WiFi + Cellular. Silver. Includes Apple Pencil Pro and Magic Keyboard.', price: 1299, originalPrice: 1599, brand: 'Apple', model: 'iPad Pro 13 M4', condition: 'like_new', categoryId: 'tablets', color: 'Silver', storageCapacity: '256GB', location: 'Cairo', country: 'Egypt' },
  { title: 'Dell XPS 16 Intel Ultra 9 32GB', description: 'Dell XPS 16 laptop with Intel Core Ultra 9 processor, 32GB RAM, 1TB SSD. NVIDIA RTX 4070. Platinum Silver, touchscreen.', price: 2199, originalPrice: 2599, brand: 'Dell', model: 'XPS 16', condition: 'new', categoryId: 'laptops', color: 'Platinum Silver', storageCapacity: '1TB', location: 'Istanbul', country: 'Turkey' },
  { title: 'iPhone 15 Pro Max 512GB Natural Titanium', description: 'iPhone 15 Pro Max, Natural Titanium, 512GB. Excellent condition with 90% battery health. Includes box, charger, and original USB-C cable.', price: 899, originalPrice: 1199, brand: 'Apple', model: 'iPhone 15 Pro Max', condition: 'excellent', categoryId: 'mobile-phones', color: 'Natural Titanium', storageCapacity: '512GB', location: 'Cairo', country: 'Egypt' },
  { title: 'Samsung Galaxy Book 4 Ultra i9', description: 'Samsung Galaxy Book 4 Ultra with Intel Core i9, 32GB RAM, 1TB SSD, RTX 4070. 16-inch 3K AMOLED display. Moonstone Gray.', price: 2399, originalPrice: 2899, brand: 'Samsung', model: 'Galaxy Book 4 Ultra', condition: 'new', categoryId: 'laptops', color: 'Moonstone Gray', storageCapacity: '1TB', location: 'Dubai', country: 'UAE' },
  { title: 'Sony WH-1000XM6 Wireless Headphones', description: 'Sony WH-1000XM6 industry-leading noise canceling headphones. Black, 40 hours battery. Like new condition, used twice.', price: 329, originalPrice: 399, brand: 'Sony', model: 'WH-1000XM6', condition: 'like_new', categoryId: 'accessories', color: 'Black', location: 'Dubai', country: 'UAE' },
  { title: 'Xbox Series X 2TB Galaxy Black', description: 'Xbox Series X 2TB Special Edition in Galaxy Black. Includes 2 controllers and 3 months Game Pass Ultimate.', price: 599, originalPrice: 699, brand: 'Microsoft', model: 'Xbox Series X', condition: 'new', categoryId: 'gaming-consoles', color: 'Galaxy Black', storageCapacity: '2TB', location: 'Cairo', country: 'Egypt' },
  { title: 'Apple Watch Ultra 3 Titanium', description: 'Apple Watch Ultra 3 with titanium case, Alpine Loop. GPS + Cellular. Perfect for outdoor and fitness. 100m water resistant.', price: 799, originalPrice: 899, brand: 'Apple', model: 'Watch Ultra 3', condition: 'new', categoryId: 'smart-watches', color: 'Natural Titanium', storageCapacity: '64GB', location: 'Istanbul', country: 'Turkey' },
  { title: 'Asus ROG Zephyrus G16 i9 RTX 4080', description: 'Asus ROG Zephyrus G16 gaming laptop. Intel Core i9, 32GB DDR5, 1TB SSD, NVIDIA RTX 4080. 16-inch QHD 240Hz display.', price: 2599, originalPrice: 2999, brand: 'Asus', model: 'ROG Zephyrus G16', condition: 'excellent', categoryId: 'laptops', color: 'Eclipse Gray', storageCapacity: '1TB', location: 'Cairo', country: 'Egypt' },
  { title: 'Google Pixel 9 Pro Fold 256GB', description: 'Google Pixel 9 Pro Fold, Porcelain, 256GB. Foldable display, Tensor G4 chip. Excellent condition with original box.', price: 1399, originalPrice: 1799, brand: 'Google', model: 'Pixel 9 Pro Fold', condition: 'like_new', categoryId: 'mobile-phones', color: 'Porcelain', storageCapacity: '256GB', location: 'Dubai', country: 'UAE' },
  { title: 'Nintendo Switch 2 OLED Mario Edition', description: 'Nintendo Switch 2 OLED Mario Edition. 512GB internal storage, 7.9-inch OLED screen. Includes Mario Kart 9 digital code.', price: 449, originalPrice: 499, brand: 'Nintendo', model: 'Switch 2 OLED', condition: 'new', categoryId: 'gaming-consoles', color: 'Red/Blue', storageCapacity: '512GB', location: 'Istanbul', country: 'Turkey' },
  { title: 'Lenovo ThinkPad X1 Carbon Gen 12', description: 'Lenovo ThinkPad X1 Carbon Gen 12 with Intel Core Ultra 7, 16GB RAM, 512GB SSD. 14-inch 2.8K OLED. Thunderbolt 4.', price: 1899, originalPrice: 2299, brand: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 12', condition: 'new', categoryId: 'laptops', color: 'Black', storageCapacity: '512GB', location: 'Cairo', country: 'Egypt' },
  { title: 'AirPods Pro 3 with USB-C', description: 'Apple AirPods Pro 3 with USB-C charging case. Active Noise Cancellation, Adaptive Audio. Brand new sealed.', price: 249, originalPrice: 279, brand: 'Apple', model: 'AirPods Pro 3', condition: 'new', categoryId: 'accessories', color: 'White', location: 'Dubai', country: 'UAE' },
  { title: 'Canon EOS R5 Mark II Mirrorless', description: 'Canon EOS R5 Mark II with 24-105mm f/4L lens kit. 45MP full-frame, 8K video. Used for one photoshoot only.', price: 3899, originalPrice: 4499, brand: 'Canon', model: 'EOS R5 Mark II', condition: 'like_new', categoryId: 'cameras', color: 'Black', location: 'Cairo', country: 'Egypt' },
  { title: 'OnePlus 13 512GB Emerald Green', description: 'OnePlus 13, Emerald Green, 512GB storage, 16GB RAM. Snapdragon 8 Elite. Hasselblad camera system. 100W charging.', price: 799, originalPrice: 899, brand: 'OnePlus', model: '13', condition: 'new', categoryId: 'mobile-phones', color: 'Emerald Green', storageCapacity: '512GB', location: 'Dubai', country: 'UAE' },
  { title: 'HP Spectre x360 16 2-in-1', description: 'HP Spectre x360 16 2-in-1 laptop with Intel Core Ultra 9, 32GB RAM, 1TB SSD. 4K OLED touchscreen. Nightfall Black.', price: 1799, originalPrice: 2099, brand: 'HP', model: 'Spectre x360 16', condition: 'excellent', categoryId: 'laptops', color: 'Nightfall Black', storageCapacity: '1TB', location: 'Istanbul', country: 'Turkey' },
  { title: 'Nothing Phone 3 256GB White', description: 'Nothing Phone 3 with transparent design, 50MP dual camera, Snapdragon 8 Gen 3. White version. Brand new sealed.', price: 599, originalPrice: 699, brand: 'Nothing', model: 'Phone 3', condition: 'new', categoryId: 'mobile-phones', color: 'White', storageCapacity: '256GB', location: 'Cairo', country: 'Egypt' },
  { title: 'Samsung Galaxy Tab S10 Ultra 512GB', description: 'Samsung Galaxy Tab S10 Ultra, 14.6-inch Dynamic AMOLED 2X. 512GB storage, 16GB RAM. With S-Pen and book cover keyboard.', price: 1199, originalPrice: 1399, brand: 'Samsung', model: 'Galaxy Tab S10 Ultra', condition: 'like_new', categoryId: 'tablets', color: 'Graphite', storageCapacity: '512GB', location: 'Dubai', country: 'UAE' },
];

const REVIEWS_DATA = [
  { rating: 5, text: 'Amazing seller! Device exactly as described, fast shipping.' },
  { rating: 4, text: 'Good product, slightly different color than picture but overall happy.' },
  { rating: 5, text: 'Perfect condition, packed very well. Would buy again!' },
  { rating: 3, text: 'Decent product, shipping took longer than expected.' },
  { rating: 5, text: 'Excellent communication, item is flawless. Highly recommended seller!' },
  { rating: 4, text: 'Great deal for the price. Device works perfectly.' },
];

@Injectable()
export class SeedService {
  private readonly password = 'Test1234!';
  private readonly adminPassword = 'Admin123!';

  constructor(private readonly dataSource: DataSource) {}

  async run() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();

      // Check if already seeded
      const existingAdmin = await queryRunner.manager.findOne('users', { where: { email: 'admin@electronix.com' } });
      if (existingAdmin) {
        return { message: 'Database already seeded. Use POST /api/v1/seed/reset?key=... to re-seed.' };
      }

      const adminHash = await argon2.hash(this.adminPassword);
      const userHash = await argon2.hash(this.password);

      // Create admin
      const adminId = uuid();
      await queryRunner.manager.query(
        `INSERT INTO "users" ("id","email","passwordHash","username","displayName","role","status","isEmailVerified","isSeller","sellerLevel","trustScore","createdAt","updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())`,
        [adminId, 'admin@electronix.com', adminHash, 'admin', 'Admin', 'super_admin', 'active', true, true, 'diamond', 100],
      );

      // Create sellers
      const sellerIds: string[] = [];
      for (const s of SELLERS) {
        const id = uuid();
        sellerIds.push(id);
        await queryRunner.manager.query(
          `INSERT INTO "users" ("id","email","passwordHash","username","displayName","role","status","isEmailVerified","isSeller","sellerLevel","trustScore","location","createdAt","updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`,
          [id, s.email, userHash, s.username, s.displayName, 'user', 'active', true, true, 'gold', 85, `${s.city}, ${s.country}`],
        );
      }

      // Create buyers
      const buyerIds: string[] = [];
      for (const b of BUYERS) {
        const id = uuid();
        buyerIds.push(id);
        await queryRunner.manager.query(
          `INSERT INTO "users" ("id","email","passwordHash","username","displayName","role","status","isEmailVerified","isSeller","trustScore","createdAt","updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
          [id, b.email, userHash, b.username, b.displayName, 'user', 'active', true, false, 50],
        );
      }

      // Create listings
      const listingIds: string[] = [];
      for (let i = 0; i < LISTINGS_DATA.length; i++) {
        const d = LISTINGS_DATA[i];
        const id = uuid();
        listingIds.push(id);
        const sellerId = sellerIds[i % sellerIds.length];
        const slug = d.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim().substring(0, 80) + '-' + id.substring(0, 8);

        const status = d.isFeatured ? 'active' : 'active';
        const viewCount = Math.floor(Math.random() * 500) + 10;
        const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString();

        await queryRunner.manager.query(
          `INSERT INTO "listings"
           ("id","title","slug","description","price","originalPrice","brand","model","condition","categoryId","categoryName","color","storageCapacity","location","country","status","sellerId","viewCount","watchCount","favoriteCount","images","tags","specifications","isFraudChecked","fraudRiskScore","createdAt","updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,0,0,$19,$20,$21,$22,0,$23,$24)`,
          [
            id, d.title, slug, d.description, d.price, d.originalPrice || null,
            d.brand, d.model, d.condition, d.categoryId, null,
            d.color || null, d.storageCapacity || null, d.location, d.country,
            status, sellerId, viewCount,
            JSON.stringify([{ url: `https://picsum.photos/seed/${id}/640/480`, isPrimary: true }]),
            JSON.stringify([d.brand, d.model, d.condition]),
            JSON.stringify({ color: d.color || '', storage: d.storageCapacity || '' }),
            true, createdAt, createdAt,
          ],
        );
      }

      // Create reviews
      const reviewTexts = [
        'Amazing seller! Device exactly as described, fast shipping.',
        'Good product, slightly different color than picture but overall happy.',
        'Perfect condition, packed very well. Would buy again!',
        'Decent product, shipping took longer than expected.',
        'Excellent communication, item is flawless. Highly recommended seller!',
        'Great deal for the price. Device works perfectly.',
        'Fast delivery and genuine product. Very satisfied.',
        'Seller was helpful with questions. Item as described.',
      ];
      for (let i = 0; i < 15 && i < listingIds.length; i++) {
        const reviewId = uuid();
        const buyerId = buyerIds[i % buyerIds.length];
        const listingId = listingIds[i];
        const listing = await queryRunner.manager.query(`SELECT "sellerId" FROM "listings" WHERE "id"=$1`, [listingId]);
        const sellerId = listing[0]?.sellerId;
        if (!sellerId) continue;
        const rating = [3, 4, 5, 5, 5, 4, 3, 5][i % 8];
        const text = reviewTexts[i % reviewTexts.length];
        await queryRunner.manager.query(
          `INSERT INTO "reviews" ("id","rating","text","authorId","sellerId","listingId","createdAt","updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
          [reviewId, rating, text, buyerId, sellerId, listingId],
        );
      }

      await queryRunner.commitTransaction();
      return {
        message: 'Database seeded successfully!',
        stats: {
          users: 1 + SELLERS.length + BUYERS.length,
          sellers: SELLERS.length,
          listings: LISTINGS_DATA.length,
          reviews: 15,
          featured: LISTINGS_DATA.filter((d) => d.isFeatured).length,
        },
        accounts: {
          admin: { email: 'admin@electronix.com', password: this.adminPassword },
          sellers: SELLERS.map((s) => ({ email: s.email, password: this.password })),
          buyers: BUYERS.map((b) => ({ email: b.email, password: this.password })),
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async reset() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager.query(`DELETE FROM "reviews"`);
      await queryRunner.manager.query(`DELETE FROM "listings"`);
      await queryRunner.manager.query(`DELETE FROM "users"`);
      await queryRunner.commitTransaction();
      return this.run();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
