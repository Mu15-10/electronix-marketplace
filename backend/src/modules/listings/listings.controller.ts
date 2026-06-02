import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingFilterDto } from './dto/listing-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Listings')
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new listing' })
  async create(@Body() dto: CreateListingDto, @CurrentUser() user: User) {
    return this.listingsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all listings with filters' })
  async findAll(@Query() filters: ListingFilterDto) {
    return this.listingsService.findAll(filters);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending listings' })
  async getTrending() {
    return this.listingsService.getTrending();
  }

  @Get('search/suggestions')
  @ApiOperation({ summary: 'Search suggestions' })
  @ApiQuery({ name: 'q', required: true })
  async getSuggestions(@Query('q') q: string) {
    return this.listingsService.searchSuggestions(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing by ID' })
  async getById(@Param('id') id: string) {
    const listing = await this.listingsService.findById(id);
    await this.listingsService.incrementViews(id);
    return listing;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update listing' })
  async update(@Param('id') id: string, @Body() dto: UpdateListingDto, @CurrentUser() user: User) {
    return this.listingsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete listing' })
  async delete(@Param('id') id: string, @CurrentUser() user: User) {
    await this.listingsService.delete(id, user.id);
    return { message: 'Listing deleted' };
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve listing (admin)' })
  async approve(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listingsService.approve(id, user.id);
  }

  @Post(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject listing (admin)' })
  async reject(@Param('id') id: string, @Body('reason') reason: string, @CurrentUser() user: User) {
    return this.listingsService.reject(id, user.id, reason);
  }

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report a listing' })
  async report(@Param('id') id: string, @Body('reason') reason: string) {
    return this.listingsService.flag(id, reason);
  }
}
