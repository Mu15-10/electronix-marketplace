import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DeviceRecognitionService } from './device-recognition.service';
import { AddDeviceDto } from './dto/add-device.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Device Recognition')
@Controller('device-recognition')
export class DeviceRecognitionController {
  constructor(private readonly deviceRecognitionService: DeviceRecognitionService) {}

  @Post('recognize')
  @ApiOperation({ summary: 'Recognize device from image' })
  async recognize(@Body('imagePath') imagePath: string) {
    return this.deviceRecognitionService.recognizeFromImage(imagePath);
  }

  @Post('estimate-condition')
  @ApiOperation({ summary: 'Estimate device condition from images' })
  async estimateCondition(@Body('images') images: string[]) {
    return this.deviceRecognitionService.estimateCondition(images);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search device database' })
  async search(@Query('q') q: string) {
    return this.deviceRecognitionService.searchDeviceDatabase(q);
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get device suggestions' })
  async suggestions(@Query('brand') brand?: string, @Query('model') model?: string) {
    return this.deviceRecognitionService.getDeviceSuggestions(brand, model);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get all devices' })
  async getAllDevices(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.deviceRecognitionService.getAllDevices({ page, limit });
  }

  @Get('devices/:id')
  @ApiOperation({ summary: 'Get device by ID' })
  async getDevice(@Param('id') id: string) {
    return this.deviceRecognitionService.getDeviceById(id);
  }

  @Post('devices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add device to database (admin)' })
  async addDevice(@Body() dto: AddDeviceDto) {
    return this.deviceRecognitionService.addDeviceToDatabase(dto);
  }
}
