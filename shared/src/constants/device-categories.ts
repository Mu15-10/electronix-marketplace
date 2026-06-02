export interface DeviceCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export const DEVICE_CATEGORIES: DeviceCategory[] = [
  {
    id: 'mobile-phones',
    name: 'Mobile Phones',
    icon: 'smartphone',
    subcategories: ['Smartphones', 'Feature Phones', 'Refurbished Phones'],
  },
  {
    id: 'tablets',
    name: 'Tablets',
    icon: 'tablet',
    subcategories: ['Android Tablets', 'iPads', 'Windows Tablets', 'E-Readers'],
  },
  {
    id: 'laptops',
    name: 'Laptops',
    icon: 'laptop',
    subcategories: ['Ultrabooks', 'Gaming Laptops', 'Business Laptops', 'Chromebooks', 'MacBooks'],
  },
  {
    id: 'desktops',
    name: 'Desktop Computers',
    icon: 'desktop',
    subcategories: ['All-in-One', 'Tower PCs', 'Mini PCs', 'Workstations', 'Gaming Desktops'],
  },
  {
    id: 'smart-watches',
    name: 'Smart Watches',
    icon: 'watch',
    subcategories: ['Apple Watch', 'Samsung Galaxy Watch', 'Fitness Trackers', 'Hybrid Watches'],
  },
  {
    id: 'gaming-consoles',
    name: 'Gaming Consoles',
    icon: 'gamepad',
    subcategories: ['PlayStation', 'Xbox', 'Nintendo Switch', 'Handheld Consoles', 'VR Headsets'],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    icon: 'headphones',
    subcategories: ['Headphones', 'Chargers', 'Cases & Covers', 'Screen Protectors', 'Cables', 'Power Banks', 'Stands', 'Keyboards', 'Mice'],
  },
  {
    id: 'network-devices',
    name: 'Network Devices',
    icon: 'wifi',
    subcategories: ['Routers', 'Modems', 'Switches', 'Access Points', 'Network Storage'],
  },
  {
    id: 'cameras',
    name: 'Cameras',
    icon: 'camera',
    subcategories: ['DSLR', 'Mirrorless', 'Point & Shoot', 'Action Cameras', 'Security Cameras', 'Lenses'],
  },
  {
    id: 'other',
    name: 'Other Electronics',
    icon: 'more-horizontal',
    subcategories: ['Drones', 'Smart Home', 'Monitors', 'Printers', 'Projectors'],
  },
];

export const MANUFACTURERS: string[] = [
  'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo',
  'Google', 'OnePlus', 'Lenovo', 'Dell', 'HP', 'Asus',
  'Acer', 'Sony', 'Nintendo', 'Microsoft', 'LG', 'Motorola',
  'Nokia', 'Realme', 'Honor', 'Tecno', 'Infinix', 'BlackBerry',
  'Panasonic', 'Toshiba', 'HTC', 'ZTE', 'Alcatel', 'Nothing',
];

export const DEVICE_CONDITIONS = [
  { id: 'brand_new', name: 'Brand New', description: 'Never used, original packaging' },
  { id: 'open_box', name: 'Open Box', description: 'Opened but never used' },
  { id: 'excellent', name: 'Excellent', description: 'Like new, minimal use' },
  { id: 'very_good', name: 'Very Good', description: 'Light signs of use' },
  { id: 'good', name: 'Good', description: 'Normal wear and tear' },
  { id: 'fair', name: 'Fair', description: 'Visible wear, fully functional' },
  { id: 'damaged', name: 'Damaged', description: 'Physical damage, may have issues' },
  { id: 'for_parts', name: 'For Parts', description: 'Not working, sold for repair' },
] as const;
