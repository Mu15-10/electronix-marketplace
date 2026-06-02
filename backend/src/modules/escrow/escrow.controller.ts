import { Controller, Get, Post, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EscrowService } from './escrow.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Escrow')
@Controller('escrow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create escrow transaction' })
  async create(@Body() dto: CreateEscrowDto, @CurrentUser() user: User) {
    return this.escrowService.createTransaction(user.id, dto.listingId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my escrow transactions' })
  async getMyTransactions(
    @CurrentUser() user: User,
    @Query('role') role: 'buyer' | 'seller' = 'buyer',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.escrowService.getTransactionHistory(user.id, role, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get escrow by ID' })
  async getById(@Param('id') id: string) {
    return this.escrowService.findById(id);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm delivery' })
  async confirmDelivery(@Param('id') id: string, @CurrentUser() user: User) {
    return this.escrowService.confirmDelivery(id, user.id);
  }

  @Post(':id/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release payment' })
  async releasePayment(@Param('id') id: string) {
    return this.escrowService.releasePayment(id);
  }

  @Post(':id/refund')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund transaction (admin)' })
  async refund(@Param('id') id: string, @Body('reason') reason: string, @Body('amount') amount?: number) {
    return this.escrowService.refund(id, reason, amount);
  }
}
