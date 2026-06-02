import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { WarrantyService } from './warranty.service';
import { CreateWarrantyDto } from './dto/create-warranty.dto';
import { SubmitClaimDto } from './dto/submit-claim.dto';
import { RejectClaimDto } from './dto/reject-claim.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Warranties')
@Controller('warranties')
export class WarrantyController {
  constructor(private readonly warrantyService: WarrantyService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a warranty' })
  async create(@Body() dto: CreateWarrantyDto) {
    return this.warrantyService.createWarranty(dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my warranties' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getMyWarranties(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.warrantyService.getUserWarranties(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('listing/:listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get warranty for a listing' })
  async getListingWarranty(@Param('listingId') listingId: string) {
    return this.warrantyService.getListingWarranty(listingId);
  }

  @Get('expiring-soon')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get warranties expiring soon (admin)' })
  @ApiQuery({ name: 'days', required: false })
  async getExpiringSoon(@Query('days') days?: string) {
    return this.warrantyService.getExpiringSoon(days ? parseInt(days, 10) : 30);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get warranty details' })
  async getWarranty(@Param('id') id: string) {
    return this.warrantyService.getWarranty(id);
  }

  @Post(':id/check-coverage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check warranty coverage for an issue' })
  async checkCoverage(@Param('id') id: string, @Body('issue') issue: string) {
    return this.warrantyService.checkCoverage(id, issue);
  }

  @Post(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a warranty claim' })
  async submitClaim(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: SubmitClaimDto) {
    return this.warrantyService.submitClaim(id, user.id, dto);
  }

  @Patch('claims/:claimId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a warranty claim (admin)' })
  async approveClaim(@Param('claimId') claimId: string, @CurrentUser() user: any) {
    return this.warrantyService.approveClaim(claimId, user.id);
  }

  @Patch('claims/:claimId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a warranty claim (admin)' })
  async rejectClaim(@Param('claimId') claimId: string, @CurrentUser() user: any, @Body() dto: RejectClaimDto) {
    return this.warrantyService.rejectClaim(claimId, user.id, dto.reason);
  }
}
