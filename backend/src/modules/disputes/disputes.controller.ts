import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Disputes')
@Controller('disputes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a dispute' })
  async create(@Body() dto: CreateDisputeDto, @CurrentUser() user: User) {
    return this.disputesService.createDispute(dto.transactionId, user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user disputes' })
  async getUserDisputes(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.disputesService.getUserDisputes(user.id, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute by ID' })
  async getById(@Param('id') id: string) {
    return this.disputesService.getDispute(id);
  }

  @Post(':id/evidence')
  @ApiOperation({ summary: 'Add evidence to dispute' })
  async addEvidence(@Param('id') id: string, @Body() evidence: { url: string; type: string }, @CurrentUser() user: User) {
    return this.disputesService.addEvidence(id, user.id, evidence);
  }

  @Post(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Resolve dispute (admin)' })
  async resolve(@Param('id') id: string, @Body('resolution') resolution: string, @CurrentUser() user: User) {
    return this.disputesService.resolveDispute(id, user.id, resolution);
  }

  @Post(':id/escalate')
  @ApiOperation({ summary: 'Escalate dispute' })
  async escalate(@Param('id') id: string) {
    return this.disputesService.escalateDispute(id);
  }

  @Post(':id/assign')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Assign moderator to dispute (admin)' })
  async assign(@Param('id') id: string, @Body('moderatorId') moderatorId: string) {
    return this.disputesService.assignModerator(id, moderatorId);
  }
}
