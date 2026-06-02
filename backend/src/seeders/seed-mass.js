const { Client } = require('pg');
const argon2 = require('argon2');
const { v4: uuid } = require('uuid');
const DB_URL = 'postgresql://electronix_db_user:rqVKKzcOUvG3orMNhGrRk1bWybc7BEnQ@dpg-d8fadc19rddc73cgeplg-a.ohio-postgres.render.com/electronix_db';

// ─── CATEGORY-BASED PRODUCT TEMPLATES ───────────────────────────
const CATS = {
  'mobile-phones': { brands: [
    { name:'Apple',      models:['iPhone 14','iPhone 15','iPhone 16','iPhone SE','iPhone 14 Pro','iPhone 15 Pro Max','iPhone 16 Pro','iPhone 16 Pro Max','iPhone 17','iPhone 17 Pro'] },
    { name:'Samsung',    models:['Galaxy S24','Galaxy S25','Galaxy S24 Ultra','Galaxy S25 Ultra','Galaxy A55','Galaxy A35','Galaxy Z Fold 6','Galaxy Z Flip 6','Galaxy M55','Galaxy F55'] },
    { name:'Google',     models:['Pixel 9','Pixel 9 Pro','Pixel 9 Pro XL','Pixel 9a','Pixel 8a','Pixel 8 Pro','Pixel Fold 2','Pixel 8'] },
    { name:'OnePlus',    models:['13','12','12R','Open','Nord 4','Nord CE4','11','11T','10T','Ace 3'] },
    { name:'Xiaomi',     models:['14 Pro','14T','13T Pro','Redmi Note 14','Redmi Note 13','Poco X7','Poco F6','Mi 14 Ultra','Redmi 14C','Poco M6'] },
    { name:'Nothing',    models:['Phone 3','Phone 2a','Phone 2','CMF Phone 1','Phone 1','Phone 3a','Phone 3a Pro'] },
    { name:'Motorola',   models:['Edge 50 Pro','Edge 50 Fusion','Razr 50','Razr 50 Ultra','Moto G85','Moto G75','Edge 40','Moto G54','Edge 30 Fusion','Moto G24'] },
    { name:'Sony',       models:['Xperia 1 VI','Xperia 5 VI','Xperia 10 VI','Xperia Pro-I II','Xperia Ace'] },
    { name:'Honor',      models:['Magic 7 Pro','Magic 6 Pro','200 Pro','200','90 GT','X9b','Pad 9','Magic V3'] },
    { name:'Realme',     models:['GT 7 Pro','GT 6','12 Pro+','12+','C67','C65','GT Neo 6','11 Pro','11','Narzo 70'] },
  ], colors:['Black','White','Silver','Gold','Titanium','Deep Purple','Midnight Blue','Graphite','Ruby Red','Ocean Blue','Emerald Green','Pink','Rose Gold','Sierra Blue','Alpine Green','Starlight','Space Gray','Coral','Violet','Matte Black'],
    storage:['64GB','128GB','256GB','512GB','1TB'], prefix:'', conditionDist:[0.15,0.25,0.35,0.15,0.1] },

  'laptops': { brands: [
    { name:'Apple',       models:['MacBook Pro 14 M4','MacBook Pro 16 M4','MacBook Air M3','MacBook Air M4','MacBook Pro 14 M3','MacBook Pro 16 M3','MacBook Air 15 M3','MacBook Pro 14 M2'] },
    { name:'Dell',        models:['XPS 16','XPS 14','XPS 13','Inspiron 16 Plus','Inspiron 15','Latitude 7450','Latitude 5550','Precision 5690','Alienware m18','Alienware x16'] },
    { name:'HP',          models:['Spectre x360 16','Spectre x360 14','Envy 16','Envy x360 15','Pavilion 15','Pavilion 14','EliteBook 860','EliteBook 840','Omen 17','Victus 16'] },
    { name:'Lenovo',      models:['ThinkPad X1 Carbon','ThinkPad X12 Detachable','ThinkPad T14s','ThinkPad P16v','Yoga 9i','Yoga 7i','Legion 9i','Legion 5i','IdeaPad 5','IdeaPad 1'] },
    { name:'Asus',        models:['ROG Zephyrus G16','ROG Zephyrus G14','ROG Strix G18','TUF A16','TUF F15','ZenBook 14 OLED','ZenBook S 13','Vivobook S 15','ProArt P16','ExpertBook B5'] },
    { name:'Acer',        models:['Predator Helios 18','Predator Helios 16','Nitro 17','Nitro 16','Swift Edge 16','Swift Go 14','Aspire 5','Aspire 3','Chromebook Plus','TravelMate P2'] },
    { name:'Microsoft',   models:['Surface Laptop 6','Surface Laptop 5','Surface Pro 10','Surface Pro 9','Surface Laptop Go 4','Surface Laptop Studio 2'] },
    { name:'MSI',         models:['Stealth 18 AI','Stealth 16 AI','Raider GE78','Titan 18 HX','Cyborg 15','Katana 17','Prestige 16','Prestige 14','Summit 13','Modern 15'] },
    { name:'Samsung',     models:['Galaxy Book 4 Ultra','Galaxy Book 4 Pro','Galaxy Book 4 Pro 360','Galaxy Book 3 Ultra','Galaxy Book 3 Pro','Galaxy Chromebook Go'] },
    { name:'LG',          models:['Gram 17','Gram 16','Gram 14','Gram Pro 16','Gram 2-in-1 16','UltraGear 17','UltraPC 15'] },
  ], colors:['Space Black','Silver','Starlight','Platinum Silver','Moonstone Gray','Eclipse Gray','Nightfall Black','Onyx Black','Alpine White','Slate Blue','Pebble Gray','Deep Blue','Rose Gold','Graphite','Steel Gray'],
    storage:['256GB','512GB','1TB','2TB','4TB'], prefix:'', conditionDist:[0.15,0.25,0.35,0.15,0.1] },

  'tablets': { brands: [
    { name:'Apple',       models:['iPad Pro 13 M4','iPad Pro 11 M4','iPad Air M3 13','iPad Air M3 11','iPad 10th Gen','iPad 9th Gen','iPad Mini 7','iPad Mini 6','iPad Air M2 13','iPad Pro 12.9 M2'] },
    { name:'Samsung',     models:['Galaxy Tab S10 Ultra','Galaxy Tab S10+','Galaxy Tab S10','Galaxy Tab S9 FE','Galaxy Tab A9+' ,'Galaxy Tab A8','Galaxy Tab S9 Ultra','Galaxy Tab S9+','Galaxy Tab Active 5','Galaxy Book Go'] },
    { name:'Lenovo',      models:['Tab P12 Pro','Tab P11 Gen 3','Tab M11','Tab M9 Gen 3','Tab P12','Tab P11 Pro','Yoga Tab 13','Legion Tab','Tab K10','Tab M10 Plus'] },
    { name:'Amazon',      models:['Fire Max 11','Fire HD 10','Fire HD 8 Plus','Fire HD 8','Fire 7','Fire HD 10 Kids','Fire Max 11 Pro'] },
    { name:'Xiaomi',      models:['Pad 7 Pro','Pad 7','Pad 6 Pro','Pad 6','Redmi Pad SE','Redmi Pad Pro','Pad 5','Pad 5 Pro'] },
    { name:'Microsoft',   models:['Surface Pro 10','Surface Pro 9','Surface Go 4','Surface Pro 8','Surface Go 3'] },
    { name:'Google',      models:['Pixel Tablet 2','Pixel Tablet'] },
    { name:'OnePlus',     models:['OnePlus Pad 2','OnePlus Pad Go','OnePlus Pad'] },
    { name:'Huawei',      models:['MatePad Pro 13.2','MatePad 11.5','MatePad SE 11','MatePad Air','MateBook E Go'] },
    { name:'Realme',      models:['Pad 2','Pad Mini','Pad','Pad X'] },
  ], colors:['Silver','Space Gray','Starlight','Graphite','Gold','Pink','Violet','Blue','Beige','Mist Blue','Onyx Gray','White','Arctic Green','Light Violet','Bronze'],
    storage:['64GB','128GB','256GB','512GB','1TB'], prefix:'', conditionDist:[0.15,0.25,0.35,0.15,0.1] },

  'desktops': { brands: [
    { name:'Apple',       models:['iMac 24 M4','iMac 27 M4','Mac Mini M4','Mac Studio M4 Max','Mac Pro M4 Ultra','iMac 24 M3','Mac Mini M2 Pro','Mac Studio M2 Ultra'] },
    { name:'Dell',        models:['XPS Desktop','Inspiron Desktop','OptiPlex Micro','Precision Workstation','Alienware Aurora','Alienware Area-51','Vostro Desktop','Latitude 3420'] },
    { name:'HP',          models:['Pavilion Desktop','Envy Desktop','Omen 45L','Omen 25L','Victus Desktop','EliteDesk 800','Z2 Tower','Z8 Fury','ProDesk 400','Business Desktop'] },
    { name:'Lenovo',      models:['Legion Tower 9i','Legion Tower 7i','IdeaCentre Tower','ThinkCentre M90a','ThinkStation P8','Yoga AIO 9i','IdeaCentre AIO','ThinkCentre Neo 50t'] },
    { name:'Asus',        models:['ROG G22CH','ROG GA35','TUF Gaming Desktop','ExpertCenter D5','Vivobook AIO','ProArt Station','Mini PC PN64','ExpertCenter S5'] },
    { name:'Acer',        models:['Predator Orion 7000','Predator Orion 5000','Nitro N50','Aspire TC','Aspire C27 AIO','Veriton N','Revo 90','Chromebox CXI5'] },
    { name:'Intel',       models:['NUC 13 Pro','NUC 12 Extreme','NUC 14 Performance','NUC X15','NUC 11 Enthusiast'] },
    { name:'Corsair',     models:['Vengeance i7400','Vengeance a7200','One i300','Crystal 280X','Corsair Custom Build'] },
    { name:'MSI',         models:['MEG Trident X2','MPG Trident 3','MAG Infinite S3','Modern AM271P','Pro DP21','Cubi 5'] },
    { name:'Gigabyte',    models:['Aorus Model S','Gigabyte GB-BER5','GB-BKi3A','Gigabyte BRIX','Gigabyte Aero 17'] },
  ], colors:['Black','White','Silver','Space Black','Graphite','Dark Gray','Gray','RGB','Clear','Matte Black','Space Gray','Titanium Gray','Onyx Black','Platinum','Rose Gold'],
    storage:['256GB','512GB','1TB','2TB','4TB'], prefix:'', conditionDist:[0.15,0.25,0.35,0.15,0.1] },

  'smart-watches': { brands: [
    { name:'Apple',       models:['Apple Watch Ultra 3','Apple Watch Series 10','Apple Watch SE 3','Apple Watch Ultra 2','Apple Watch Series 9','Apple Watch SE 2','Apple Watch Series 8','Apple Watch Series 7'] },
    { name:'Samsung',     models:['Galaxy Watch 7 Pro','Galaxy Watch 7','Galaxy Watch FE','Galaxy Watch 6 Classic','Galaxy Watch 6','Galaxy Watch 5 Pro','Galaxy Fit 3','Galaxy Ring'] },
    { name:'Garmin',      models:['Fenix 8','Fenix 7 Pro','Epix Pro Gen 2','Forerunner 265','Forerunner 965','Venu 3','Instinct 3','Vivoactive 6','Lily 2','Vivomove Trend'] },
    { name:'Fitbit',      models:['Fitbit Sense 3','Fitbit Versa 5','Fitbit Charge 6','Fitbit Inspire 3','Fitbit Luxe','Fitbit Ace 4','Fitbit Versa 4','Fitbit Sense 2'] },
    { name:'Amazfit',     models:['T-Rex Ultra','Falcon','Cheetah Pro','Balance','Active','Neo','Bip 5','GTR 4','GTS 4 Mini','Band 7'] },
    { name:'Huawei',      models:['Watch GT 5 Pro','Watch GT 5','Watch D2','Watch 4 Pro','Watch Fit 3','Watch GT 4','Watch Buds','Watch Ultimate'] },
    { name:'Xiaomi',      models:['Watch S4','Watch S3','Watch 2 Pro','Smart Band 9 Pro','Smart Band 9','Smart Band 8 Pro','Redmi Watch 5','Redmi Watch 4'] },
    { name:'Google',      models:['Pixel Watch 3','Pixel Watch 2','Pixel Watch'] },
    { name:'OnePlus',     models:['OnePlus Watch 3','OnePlus Watch 2r','OnePlus Watch 2','OnePlus Nord Watch'] },
    { name:'Coros',       models:['Apex 3','Vertix 3','Pace 4','Pace 3','Apex 2 Pro','Vertix 2s'] },
  ], colors:['Titanium','Black','White','Silver','Graphite','Gold','Pink Gold','Stainless Steel','Midnight','Starlight','Cream','Blue','Green','Coral','Deep Blue'],
    storage:['4GB','8GB','16GB','32GB','64GB'], prefix:'', conditionDist:[0.15,0.25,0.35,0.15,0.1] },

  'gaming-consoles': { brands: [
    { name:'Sony',        models:['PlayStation 6','PlayStation 5 Pro','PlayStation 5 Slim','PlayStation 5 Digital','PlayStation Portal','PlayStation VR 3','PlayStation 4 Pro','PlayStation 4 Slim'] },
    { name:'Microsoft',   models:['Xbox Series X 2TB','Xbox Series X','Xbox Series S','Xbox Series S 1TB','Xbox Elite Controller 3','Xbox Adaptive Controller'] },
    { name:'Nintendo',    models:['Switch 2 OLED','Switch 2','Switch OLED','Switch Lite','Switch','Switch OLED Zelda Edition','Switch 2 Mario Edition','3DS XL'] },
    { name:'Valve',       models:['Steam Deck OLED','Steam Deck 2','Steam Deck LCD','Steam Deck'] },
    { name:'ASUS',        models:['ROG Ally X','ROG Ally','ROG Ally 2'] },
    { name:'Lenovo',      models:['Legion Go S','Legion Go 2','Legion Go'] },
    { name:'Meta',        models:['Quest 4','Quest 3S','Quest 3','Quest Pro 2','Quest 2'] },
    { name:'MSI',         models:['Claw 8 AI+','Claw 7 AI+','Claw A1M'] },
    { name:'Logitech',    models:['G Cloud','G Cloud 2'] },
    { name:'Razer',       models:['Edge 5G','Edge WiFi','Kishi Ultra Controller','Wolverine V3 Pro'] },
  ], colors:['White','Black','Gray','Midnight Black','Carbon Black','Galaxy Black','Neon Blue','Red/Blue','Red','Cosmo Black','Edge Gray','Rainbow','Purple','Clear','Arctic White'],
    storage:['256GB','512GB','1TB','2TB','4TB'], prefix:'', conditionDist:[0.15,0.25,0.35,0.15,0.1] },

  'accessories': { brands: [
    { name:'Apple',       models:['AirPods Pro 3','AirPods 4','AirPods Max 2','MagSafe Charger','Apple Pencil Pro','Magic Keyboard','AirTag 2','USB-C Charger','20W Adapter','FineWoven Case'] },
    { name:'Samsung',     models:['Galaxy Buds 3 Pro','Galaxy Buds FE','Galaxy Buds 3','45W Charger','Wireless Charger Trio','Smart Tag 2','S-Pen Pro','Galaxy Book Cover','USB-C Headphones','Fast Charger'] },
    { name:'Anker',       models:['PowerCore 20K','PowerCore 10K','Nano 65W Charger','MagSafe Battery','USB-C Hub','PowerLine III Cable','Soundcore Space A40','Soundcore Liberty 4','737 Charger','PowerPort Atom'] },
    { name:'Sony',        models:['WH-1000XM6','WH-1000XM5','WF-1000XM6','WF-1000XM5','LinkBuds S','Ult Wear','SRS-XB100 Speaker','WH-G900N','INZONE H9','SRS-NB10'] },
    { name:'JBL',         models:['Tune 770NC','Tune Beam','Tune Flex','Quantum 910X','Quantum 360X','Flip 7','Charge 6','Xtreme 4','Go 4','Clip 5'] },
    { name:'Logitech',    models:['MX Master 3S','MX Mechanical','G Pro X Superlight 2','G915 X','MX Keys S','C920 Pro Webcam','G502 X Plus','Pro X 2 Lightspeed','G733','Brio 500'] },
    { name:'Belkin',      models:['BoostCharge Pro 3-in-1','BoostCharge 15W','Magsafe Car Mount','USB-C to HDMI','SoundForm Mini','SoundForm Rise','Wemo Smart Plug','Connect USB-C Hub'] },
    { name:'Spigen',      models:['Ultra Hybrid Case','Liquid Air Case','Rugged Armor','Glass Protector','MagSafe Ring','Thin Fit Case','Neo Hybrid','Tempered Glass','Wallet Case','Qi Wireless Charger'] },
    { name:'Ugreen',      models:['100W GaN Charger','65W GaN Charger','USB-C Cable 3M','Power Strip','USB-C Hub 9-in-1','Laptop Stand','Portable Charger','Thunderbolt Cable','Wireless Charger','Car Charger'] },
    { name:'Bose',        models:['QuietComfort Ultra','QuietComfort Earbuds 2','QuietComfort SC','Bose 700','SoundLink Max','Bose Ultra Open','SoundLink Flex 2','Smart Soundbar 600','TV Speaker','QuietComfort 45'] },
  ], colors:['Black','White','Silver','Gray','Blue','Red','Purple','Green','Pink','Beige','Transparent','Midnight','Space Gray','Product Red','Sage Green'],
    storage:'none', prefix:'', conditionDist:[0.2,0.3,0.3,0.15,0.05] },

  'network-devices': { brands: [
    { name:'TP-Link',     models:['Archer AX11000','Archer AXE300','Archer AX73','Deco X95','Deco X55','Tapo C425','TL-SG1024','ER8411','RE815XE','Omada EAP773'] },
    { name:'Netgear',     models:['Nighthawk RS700','Orbi 970','Nighthawk RAXE500','Orbi 960','Nighthawk MK92','GS324TP','M6 Pro','AX1800','WAX630E','Orbi LBR20'] },
    { name:'Asus',        models:['GT-AXE16000','GT-AX11000 Pro','RT-AX86U Pro','RT-AX57','ZenWiFi BQ16','ZenWiFi XD6','RT-BE96U','GT-BE98','RT-AC68U','AiMesh XT8'] },
    { name:'Ubiquiti',    models:['Dream Machine SE','Dream Router','UniFi 6 Enterprise','UniFi 6 Pro','Cloud Gateway Ultra','Aggregation Switch','UniFi LTE Backup','Flex Mini','AI 360 Camera','G4 Doorbell'] },
    { name:'Cisco',       models:['Business 250','RV345','Catalyst 1200','Meraki GO','Small Business 110','CBS220-24P','SMB 350','SPA504G','WAP581','ATA 192'] },
    { name:'Synology',    models:['RT6600ax','WRX560','RT2600ac','MR2200ac','RX540','Synology Router 2'] },
    { name:'Google',      models:['Nest WiFi Pro','Nest WiFi Router','Google WiFi 2','Nest WiFi Point','Google Mesh'] },
    { name:'Eero',        models:['Eero Pro 6E','Eero 6+','Eero Max 7','Eero PoE Gateway','Eero Outdoor 7'] },
    { name:'D-Link',      models:['R32 Eagle Pro','DIR-X5460','COVR-X1872','DAP-1620','DGS-1100','DMS-106XT','DNS-320L','DWR-953','DHP-W611AV','DCS-8302LH'] },
    { name:'Ruckus',      models:['ICX 7150','R750','R550','R350','H510','ZoneFlex R710','T610','P300','ICX 7650','E510'] },
  ], colors:['Black','White','Gray','Dark Gray','Blue','White/Blue','White/Black','Matte Black','Slate Gray','Translucent'], storage:'none', prefix:'', conditionDist:[0.2,0.3,0.3,0.15,0.05] },

  'cameras': { brands: [
    { name:'Canon',       models:['EOS R5 Mark II','EOS R6 Mark III','EOS R3','EOS R8','EOS R100','EOS R50','EOS 90D','EOS 2000D','PowerShot G7X IV','PowerShot V10'] },
    { name:'Sony',        models:['Alpha A1 II','Alpha A7R V','Alpha A7 IV','Alpha A6700','Alpha ZV-E10 II','ZV-1 III','RX100 VII','FX6','Alpha 9 III','Alpha A7C II'] },
    { name:'Nikon',       models:['Z9','Z8','Zf','Z6 III','Z7 II','Z50 II','Z30','Z fc','D850','Coolpix P1000'] },
    { name:'Fujifilm',    models:['GFX 100S II','X-H2','X-T5','X-S20','X100VI','X-E4','X-T50','GFX 50S II','Instax Mini 99','Instax Wide 400'] },
    { name:'Panasonic',   models:['Lumix S5 II','Lumix S5 IIX','Lumix GH7','Lumix G9 II','Lumix S9','Lumix ZS200D','HC-X2000','AG-CX20','Lumix TZ95','Lumix FZ80D'] },
    { name:'DJI',         models:['Osmo Pocket 3','Osmo Action 5','Osmo Action 4','Osmo Mobile 6','Air 3S','Mini 4 Pro','Mavic 4 Pro','Avata 2','Inspire 4','Ronin 4D'] },
    { name:'GoPro',       models:['Hero 14 Black','Hero 13 Black','Hero 12 Black','Hero 11 Mini','Hero 10','Max 2 360','Hero 8 Silver','Hero 12 Mini'] },
    { name:'OM System',   models:['OM-1 Mark II','OM-5','OM-3','TG-7','EM-10 Mark IV'] },
    { name:'Ricoh',       models:['GR IIIx','GR III','Theta Z1','WG-90','WG-8'] },
    { name:'Leica',       models:['Q3','M11','M11-P','SL3','D-Lux 8','Q2','M11 Monochrom','S3','C-Lux','V-Lux 5'] },
  ], colors:['Black','Silver','White','Graphite','Slate Gray','Red','Green','Orange','Blue','Desert Tan','Olive','Beige','Dark Gray','Bronze','Champagne'],
    storage:'none', prefix:'', conditionDist:[0.15,0.25,0.35,0.15,0.1] },

  'other': { brands: [
    { name:'DJI',         models:['Mavic 4 Pro','Mini 3 Pro','Air 3','Avata 2','Mini 4 Pro','Mavic 3 Classic','FPV Explorer','Neo','RS 4 Pro','RoboMaster S1'] },
    { name:'Samsung',     models:['ViewFinity S9 Monitor','Odyssey OLED G8','Jet Bot AI+','Bespoke Refrigerator','The Frame TV','Smart Monitor M8','Music Frame','Bespoke Jet AI','The Freestyle 2','Buds Case'] },
    { name:'LG',          models:['C4 OLED TV','G4 OLED TV','UltraGear 32GR93U','UltraWide 49WQ95C','XBOOM 360 Speaker','Gram Laptop Case','ThinQ Washer','Smart Monitor 27','StanbyMe Go','Tiiun Garden'] },
    { name:'Apple',       models:['Mac Studio Display','Apple TV 4K','HomePod 3','HomePod Mini 2','Vision Pro','Magic Mouse 3','USB-C EarPods','iPod Touch','Display Studio Pro','Laser Engraving'] },
    { name:'Anker',       models:['Eufy RoboVac X10','EufyCam 3','Nebula Capsule','Nebula Vega','Soundcore Motion+','EverFrost Cooler','MagGo Power Bank','PowerWave Stand','PowerConf C300','Solar Panel'] },
    { name:'Sony',        models:['BRAVIA XR A95L','SRS-RA5000','HT-A9','HT-A7000','WH-1000XM5','WLA-NS7','PlayStation VR2','Xperia Projector','SXRD Projector','Spatial Reality Display'] },
    { name:'Philips',     models:['Hue Play Gradient','Hue Bridge 2.0','Sonicare DiamondClean','OneBlade 360','Airfryer XXL','Instant Pot','GoFlex Extend','TAA5205 Soundbar','Fidelio L4','Wake-Up Light'] },
    { name:'Dyson',       models:['V15 Detect','Gen5 Detect','360 Vis Nav','Purifier Hot+Cool Formaldehyde','Airwrap Complete','Supersonic Nural','Corrale Straightener','WashG1 Wet Cleaner','360 Glide Sweeper','Hydro Trim'] },
    { name:'Ring',        models:['Video Doorbell 5','Stick Up Cam Pro','Floodlight Cam Wired Pro','Indoor Cam Pro','Alarm Pro','Car Cam','Peephole Cam','Pan-Tilt Indoor','Chime Pro 2','Motion Sensor'] },
    { name:'Razer',       models:['Blade 18','Blade 16','Blade 14','DeathAdder V4 Pro','BlackWidow V4 75%','Kraken V4 Pro','Barracuda Pro','Base Station V3','Chroma RGB Strip','Mouse Bungee V3'] },
  ], colors:['Black','White','Silver','Gray','Blue','Red','Orange','Green','Pink','Matte Black','Space Gray','Beige','Dark Gray','Sea Blue','Cherry Red'],
    storage:'none', prefix:'', conditionDist:[0.2,0.3,0.3,0.15,0.05] },
};

const CONDITIONS = ['new','like_new','excellent','good','fair'];
const LOC_COUNTRY = [
  ['Cairo','Egypt'],['Alexandria','Egypt'],['Giza','Egypt'],['Dubai','UAE'],['Abu Dhabi','UAE'],
  ['Sharjah','UAE'],['Riyadh','Saudi Arabia'],['Jeddah','Saudi Arabia'],['Doha','Qatar'],
  ['Kuwait City','Kuwait'],['Manama','Bahrain'],['Muscat','Oman'],['Istanbul','Turkey'],
  ['Ankara','Turkey'],['Izmir','Turkey'],['London','UK'],['Manchester','UK'],
  ['Berlin','Germany'],['Munich','Germany'],['Paris','France'],['Milan','Italy'],
  ['Madrid','Spain'],['Barcelona','Spain'],['Lagos','Nigeria'],['Nairobi','Kenya'],
  ['Casablanca','Morocco'],['Tunis','Tunisia'],['Amman','Jordan'],['Beirut','Lebanon'],
  ['Rabat','Morocco'],['Karachi','Pakistan'],['Lahore','Pakistan'],['Mumbai','India'],
  ['Dubai Internet City','UAE'],['Abu Dhabi Digital Park','UAE'],
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generate(slug, count) {
  const cat = CATS[slug];
  if (!cat) return [];
  const items = [];
  const cDist = cat.conditionDist || [0.15,0.25,0.35,0.15,0.1];

  for (let i = 0; i < count; i++) {
    const brand = cat.brands[i % cat.brands.length];
    const model = brand.models[i % brand.models.length];
    const storages = Array.isArray(cat.storage) ? cat.storage : [''];
    const storage = storages[i % storages.length];
    const color = cat.colors[i % cat.colors.length];
    const condIdx = i % 5;
    const condition = CONDITIONS[condIdx];
    const [loc, country] = LOC_COUNTRY[i % LOC_COUNTRY.length];

    // Price based on category + condition
    let basePrice;
    switch (slug) {
      case 'mobile-phones': basePrice = 200 + Math.random() * 1300; break;
      case 'laptops': basePrice = 400 + Math.random() * 3600; break;
      case 'tablets': basePrice = 150 + Math.random() * 1200; break;
      case 'desktops': basePrice = 400 + Math.random() * 5000; break;
      case 'smart-watches': basePrice = 80 + Math.random() * 720; break;
      case 'gaming-consoles': basePrice = 100 + Math.random() * 900; break;
      case 'accessories': basePrice = 10 + Math.random() * 300; break;
      case 'network-devices': basePrice = 30 + Math.random() * 600; break;
      case 'cameras': basePrice = 200 + Math.random() * 4000; break;
      default: basePrice = 50 + Math.random() * 1000;
    }
    const condMultiplier = [1, 0.85, 0.75, 0.6, 0.45][condIdx];
    const price = Math.round((basePrice * condMultiplier) * 100) / 100;
    const originalPrice = condIdx < 2 ? Math.round(price * (1.1 + Math.random() * 0.4)) : null;

    const title = (brand.name + ' ' + model + (storage ? ' ' + storage : '') + (color ? ' ' + color : '') + ' #' + (i+1)).replace(/\s+/g,' ').trim();

    const desc = [
      pick(['Excellent','Great','Like new','Mint','Well-maintained','Pristine','Premium','Top-notch','Authentic','Professionally used']),
      pick(['condition','quality','unit','device','product','item','piece','specimen']),
      '-', brand.name, model + '.',
      pick(['Fully functional,','Works perfectly,','Minor wear,','No scratches,','Perfect screen,','All original packaging,','Full box package,']),
      pick(['comes with accessories.','includes all cables.','with original charger.','ready to use.','no issues at all.','tested and confirmed.'])
    ].join(' ');

    items.push({ title, description: desc, price, originalPrice, listingType: 'fixed', condition, brand: brand.name, model, color: color || '', storageCapacity: storage, location: loc, country, status: 'active', categoryId: slug, seoData: JSON.stringify({ slug: title.toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'') + '-' + uuid().substring(0,8), metaTitle: title, metaDescription: desc.substring(0,160) }), images: JSON.stringify([{ url: 'https://picsum.photos/seed/' + uuid().substring(0,8) + '/640/480', isPrimary: true }]), tags: JSON.stringify([brand.name, model, condition]), specifications: JSON.stringify({ color: color || '', storage: storage || '' }), isFraudChecked: true, fraudRiskScore: 0 });
  }
  return items;
}

// ────────────────────────────────────────────────────────────────
const DIST = [
  ['mobile-phones',     800],
  ['tablets',            400],
  ['laptops',            700],
  ['desktops',           300],
  ['smart-watches',      350],
  ['gaming-consoles',    350],
  ['accessories',        900],
  ['network-devices',    300],
  ['cameras',            350],
  ['other',              550],
];

const REVIEWS = [
  [5,'Perfect! Exactly as described, fast shipping. Highly recommend this seller!'],
  [4,'Great device, conditions are excellent. Good communication from seller.'],
  [5,'Amazing quality, packed very well. Would definitely buy again.'],
  [5,'Outstanding seller. The product is pristine and works like a charm.'],
  [4,'Very good overall. Minor wear as described, fair price.'],
  [3,'Decent product. Shipping took longer than expected but item is okay.'],
  [5,'Flawless transaction. Fast delivery, genuine product with box.'],
  [4,'Good experience. Seller answered all questions promptly. Recommended.'],
  [5,'Brand new as advertised. Unbelievable price for this quality.'],
  [5,'Smooth transaction. Device looks brand new, very happy!'],
  [4,'Good quality product. Described accurately. Fast shipping.'],
  [5,'Perfect transaction. Highly recommended seller, will buy from again!'],
  [2,'Item worked for a week then had issues. Seller offered partial refund.'],
  [4,'Nice product. Condition is as described. Good value for money.'],
  [5,'Exceptional! Better than expected. Fast shipping and great packaging.'],
  [3,'Average condition. Some scratches not mentioned in listing. Acceptable.'],
  [5,'Perfect condition, genuine Apple product. 100% satisfied.'],
  [4,'Good purchase. Fair price and fast delivery. Would deal again.'],
  [5,'Flawless like new. Original box and accessories included. Recommended!'],
  [5,'Excellent seller. Item arrived quickly and works perfectly. Thanks!'],
];

async function seed() {
  const client = new Client({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected');
  console.log('STEP users=1 listings=2 reviews=3');

  // Wipe all data
  for (const tbl of ['reviews','wishlist','listings','users']) {
    try { await client.query(`DELETE FROM "${tbl}"`); console.log('Cleared ' + tbl); }
    catch (e) { console.log('Skipped ' + tbl + ': ' + e.message); }
  }
  console.log('');

  // Create users
  const hashes = await Promise.all([argon2.hash('Admin123!'), argon2.hash('Test1234!')]);
  const [adminHash, userHash] = hashes;

  const adminId = uuid();
  await client.query(`INSERT INTO "users"("id","email","passwordHash","username","displayName","role","status","isEmailVerified","isSeller","sellerLevel","trustScore","location","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`,
    [adminId,'admin@electronix.com',adminHash,'admin','Admin','super_admin','active',true,true,'diamond',100,'Dubai, UAE']);
  console.log('Admin created: admin@electronix.com / Admin123!');

  const SELLERS = [
    ['ahmed@example.com','ahmedtech','Ahmed Hassan','Cairo, Egypt'],
    ['sarah@example.com','sarahgadgets','Sarah Mohamed','Dubai, UAE'],
    ['omar@example.com','omarstore','Omar Ali','Istanbul, Turkey'],
    ['hassan@example.com','hassanel','Hassan Ibrahim','Riyadh, KSA'],
    ['noor@example.com','noorplanet','Noor Al-Mansoori','Doha, Qatar'],
  ];
  const sellerIds = [];
  for (const [email,user,disp,loc] of SELLERS) {
    const id = uuid(); sellerIds.push(id);
    await client.query(`INSERT INTO "users"("id","email","passwordHash","username","displayName","role","status","isEmailVerified","isSeller","sellerLevel","trustScore","location","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())`,
      [id,email,userHash,user,disp,'user','active',true,true,'gold',80+Math.floor(Math.random()*15),loc]);
  }
  console.log('5 sellers created');

  const BUYERS = [
    ['layla@example.com','laylax','Layla Ahmed'],
    ['khaled@example.com','khaled99','Khaled Mostafa'],
    ['mariam@example.com','mariam_e','Mariam Youssef'],
    ['youssef@example.com','yousseffx','Youssef Khaled'],
    ['rana@example.com','ranaworld','Rana Tarek'],
  ];
  const buyerIds = [];
  for (const [email,user,disp] of BUYERS) {
    const id = uuid(); buyerIds.push(id);
    await client.query(`INSERT INTO "users"("id","email","passwordHash","username","displayName","role","status","isEmailVerified","isSeller","trustScore","createdAt","updatedAt") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())`,
      [id,email,userHash,user,disp,'user','active',true,false,50]);
  }
  console.log('5 buyers created\n');

  // Generate & insert listings in batch
  let totalListings = 0;
  let batch = [];
  const BATCH_SIZE = 500;

  for (const [slug, count] of DIST) {
    const items = generate(slug, count);
    for (const item of items) {
      const id = uuid();
      batch.push([id, item.title, item.description, item.price, item.originalPrice, item.listingType, item.condition, item.brand, item.model, item.color, item.storageCapacity, item.images, item.location, item.country, item.status, pick(sellerIds), Math.floor(Math.random()*500)+10, item.seoData, item.specifications, item.tags, item.categoryId, item.isFraudChecked, item.fraudRiskScore, new Date(Date.now()-Math.floor(Math.random()*60)*86400000)]);
      totalListings++;

      if (batch.length >= BATCH_SIZE) {
        await insertBatch(client, batch);
        batch = [];
        process.stdout.write('.');
      }
    }
    console.log('\n' + slug + ': ' + items.length + ' products');
  }
  if (batch.length > 0) await insertBatch(client, batch);
  console.log('\nTotal: ' + totalListings + ' listings created\n');

  // Reviews
  const listingIds = (await client.query('SELECT id FROM listings ORDER BY RANDOM() LIMIT 1500')).rows.map(r => r.id);
  let reviewsDone = 0;
  let reviewBatch = [];
  for (let i = 0; i < Math.min(1500, listingIds.length); i++) {
    const lr = await client.query('SELECT "sellerId" FROM listings WHERE id=$1', [listingIds[i]]);
    const sellerId = lr.rows[0]?.sellerId;
    if (!sellerId) continue;
    const [rating, text] = REVIEWS[i % REVIEWS.length];
    reviewBatch.push([uuid(), rating, text, pick(buyerIds), sellerId, listingIds[i], new Date()]);
    reviewsDone++;
    if (reviewBatch.length >= 100) {
      await insertReviews(client, reviewBatch);
      reviewBatch = [];
    }
  }
  if (reviewBatch.length > 0) await insertReviews(client, reviewBatch);
  console.log(reviewsDone + ' reviews created');

  await client.end();
  console.log('\n████████████████████████████████');
  console.log('  SEED COMPLETE!');
  console.log('████████████████████████████████');
  console.log('Admin: admin@electronix.com / Admin123!');
  console.log('Test accounts: Test1234!');
  console.log('Total: ' + totalListings + ' products in ' + DIST.length + ' categories');
}

async function insertBatch(client, batch) {
  const cols = ['"id"','"title"','"description"','"price"','"originalPrice"','"listingType"','"condition"','"brand"','"model"','"color"','"storageCapacity"','"images"','"location"','"country"','"status"','"sellerId"','"viewCount"','"seoData"','"specifications"','"tags"','"categoryId"','"isFraudChecked"','"fraudRiskScore"','"createdAt"'];
  const cc = cols.join(',');
  const values = batch.map((row, idx) => {
    const offset = idx * 24;
    return row.map((_, j) => '$' + (offset + j + 1)).join(',');
  }).join('),(');
  const flat = batch.flat();
  await client.query(`INSERT INTO listings (${cc}) VALUES (${values})`, flat);
}

async function insertReviews(client, batch) {
  const cols = ['"id"','"rating"','"content"','"authorId"','"sellerId"','"listingId"','"createdAt"'];
  const cc = cols.join(',');
  const values = batch.map((row, idx) => {
    const offset = idx * 7;
    return row.map((_, j) => '$' + (offset + j + 1)).join(',');
  }).join('),(');
  const flat = batch.flat();
  await client.query(`INSERT INTO reviews (${cc}) VALUES (${values})`, flat);
}

seed().catch(err => { console.error(err); process.exit(1); });
