import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FraudService } from './fraud.service';
import { ResolveAlertDto } from './dto/resolve-alert.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Fraud')
@Controller('fraud')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
@ApiBearerAuth()
export class FraudController {
  constructor(private readonly fraudService: FraudService) {}

  @Get('alerts')
  @ApiOperation({ summary: 'Get fraud alerts' })
  async getAlerts(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.fraudService.getFraudAlerts({ page, limit });
  }

  @Get('alerts/:id')
  @ApiOperation({ summary: 'Get fraud alert by ID' })
  async getAlert(@Param('id') id: string) {
    return this.fraudService.getFraudAlert(id);
  }

  @Patch('alerts/:id/resolve')
  @ApiOperation({ summary: 'Resolve fraud alert' })
  async resolveAlert(@Param('id') id: string, @Body() dto: ResolveAlertDto, @CurrentUser() user: User) {
    return this.fraudService.resolveFlag(id, user.id, dto);
  }

  @Get('analysis/user/:id')
  @ApiOperation({ summary: 'Analyze user for fraud' })
  async analyzeUser(@Param('id') id: string) {
    return this.fraudService.analyzeUserById(id);
  }

  @Get('analysis/listing/:id')
  @ApiOperation({ summary: 'Analyze listing for fraud' })
  async analyzeListing(@Param('id') id: string) {
    return this.fraudService.analyzeListingById(id);
  }
}
