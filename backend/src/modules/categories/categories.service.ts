import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing, ListingStatus } from '../listings/entities/listing.entity';

interface DeviceCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

const DEVICE_CATEGORIES: DeviceCategory[] = [
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

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
  ) {}

  async findAll() {
    const results = await Promise.all(
      DEVICE_CATEGORIES.map(async (cat) => {
        const count = await this.listingRepository.count({
          where: { categoryId: cat.id, status: ListingStatus.ACTIVE },
        });
        return { ...cat, listings_count: count };
      }),
    );
    return { results };
  }

  async findById(id: string) {
    const category = DEVICE_CATEGORIES.find((c) => c.id === id);
    if (!category) throw new NotFoundException('Category not found');
    const count = await this.listingRepository.count({
      where: { categoryId: id, status: ListingStatus.ACTIVE },
    });
    return { ...category, listings_count: count };
  }

  async getListings(id: string, page = 1, limit = 20) {
    const category = DEVICE_CATEGORIES.find((c) => c.id === id);
    if (!category) throw new NotFoundException('Category not found');
    const skip = (page - 1) * limit;
    const [items, total] = await this.listingRepository.findAndCount({
      where: { categoryId: id, status: ListingStatus.ACTIVE },
      relations: ['seller'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { results: items, count: total, page, limit };
  }
}
