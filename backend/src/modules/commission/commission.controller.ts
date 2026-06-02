import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CommissionService } from './commission.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Commissions')
@Controller('commissions')
export class CommissionController {
  constructor(private readonly commissionService: CommissionService) {}

  @Get('configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all commission configs (admin)' })
  async getConfigs() {
    return this.commissionService.getCommissionConfigs();
  }

  @Post('configs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create commission config (admin)' })
  async createConfig(@Body() dto: any, @CurrentUser() user: any) {
    return this.commissionService.createCommissionConfig(dto, user.id);
  }

  @Patch('configs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update commission config (admin)' })
  async updateConfig(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.commissionService.updateCommissionConfig(id, dto, user.id);
  }

  @Delete('configs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete commission config (admin)' })
  async deleteConfig(@Param('id') id: string, @CurrentUser() user: any) {
    return this.commissionService.deleteCommissionConfig(id, user.id);
  }

  @Post('calculate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate commission for an amount' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'sellerLevel', required: false })
  async calculate(
    @Body('amount') amount: number,
    @Query('category') category?: string,
    @Query('sellerLevel') sellerLevel?: string,
  ) {
    return this.commissionService.calculateTotalFees(
      amount,
      category,
      sellerLevel ? parseInt(sellerLevel, 10) : undefined,
    );
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my commission history' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMyCommissions(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.commissionService.getSellerCommissions(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get platform revenue report (admin)' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getRevenue(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.commissionService.getPlatformRevenue({ startDate, endDate });
  }

  @Get('breakdown/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get commission breakdown for a transaction' })
  async getBreakdown(@Param('transactionId') transactionId: string) {
    return this.commissionService.getCommissionBreakdown(transactionId);
  }
}
