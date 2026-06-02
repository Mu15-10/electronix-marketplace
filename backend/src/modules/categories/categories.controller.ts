import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  async getById(@Param('id') id: string) {
    return this.categoriesService.findById(id);
  }

  @Get(':id/listings')
  @ApiOperation({ summary: 'Get listings by category' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getListings(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.categoriesService.getListings(id, page, limit);
  }
}
