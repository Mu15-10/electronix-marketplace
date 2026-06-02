import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { CalculateCostDto } from './dto/calculate-cost.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { SchedulePickupDto } from './dto/schedule-pickup.dto';
import { AddProviderDto } from './dto/add-provider.dto';
import { ShippingFilterDto } from './dto/shipping-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('calculate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate shipping cost' })
  async calculate(@Body() dto: CalculateCostDto) {
    return this.shippingService.calculateCost(dto.weight, dto.dimensions, dto.fromAddress, dto.toAddress, dto.deliveryType);
  }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new shipment' })
  async create(@Body() dto: CreateShipmentDto) {
    return this.shippingService.createShipment(dto);
  }

  @Get('my-shipments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my shipments' })
  @ApiQuery({ name: 'role', required: false, enum: ['buyer', 'seller'] })
  async getMyShipments(@CurrentUser() user: any, @Query('role') role?: 'buyer' | 'seller') {
    return this.shippingService.getShipmentsByUser(user.id, role || 'buyer');
  }

  @Get('track/:trackingNumber')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Track shipment by tracking number' })
  async track(@Param('trackingNumber') trackingNumber: string) {
    return this.shippingService.trackShipment(trackingNumber);
  }

  @Get('providers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active shipping providers' })
  async getProviders() {
    return this.shippingService.getProviders();
  }

  @Post('providers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a shipping provider' })
  async addProvider(@Body() dto: AddProviderDto) {
    return this.shippingService.addProvider(dto);
  }

  @Delete('providers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a shipping provider' })
  async removeProvider(@Param('id') id: string) {
    await this.shippingService.removeProvider(id);
    return { message: 'Provider removed' };
  }

  @Get('delivery-types')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available delivery types' })
  async getDeliveryTypes() {
    return this.shippingService.getDeliveryTypes();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipment details' })
  async getShipment(@Param('id') id: string) {
    return this.shippingService.getShipment(id);
  }

  @Get(':id/label')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipment label' })
  async getLabel(@Param('id') id: string) {
    return this.shippingService.getShippingLabel(id);
  }

  @Post(':id/update-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update shipment status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.shippingService.updateStatus(id, dto.status, dto.note, dto.location);
  }

  @Post(':id/verify-delivery')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify delivery with PIN' })
  async verifyDelivery(@Param('id') id: string, @Body('pin') pin: string) {
    return this.shippingService.verifyDelivery(id, pin);
  }

  @Post(':id/schedule-pickup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule a pickup' })
  async schedulePickup(@Param('id') id: string, @Body() dto: SchedulePickupDto) {
    return this.shippingService.schedulePickup(id, dto);
  }
}
