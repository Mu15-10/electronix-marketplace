import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdvertisingService } from './advertising.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { CreateAdDto } from './dto/create-ad.dto';
import { UpdateAdDto } from './dto/update-ad.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';

@ApiTags('Advertising')
@Controller('advertising')
export class AdvertisingController {
  constructor(private readonly advertisingService: AdvertisingService) {}

  // ---- CAMPAIGNS ----

  @Post('campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a campaign' })
  async createCampaign(@Body() dto: CreateCampaignDto, @CurrentUser() user: User) {
    return this.advertisingService.createCampaign(dto, user.id);
  }

  @Get('campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user campaigns' })
  async getUserCampaigns(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.advertisingService.getUserCampaigns(user.id, { page, limit });
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  async getCampaign(@Param('id') id: string) {
    return this.advertisingService.getCampaign(id);
  }

  @Patch('campaigns/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update campaign' })
  async updateCampaign(@Param('id') id: string, @Body() dto: UpdateCampaignDto, @CurrentUser() user: User) {
    return this.advertisingService.updateCampaign(id, dto, user.id);
  }

  @Post('campaigns/:id/pause')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pause campaign' })
  async pauseCampaign(@Param('id') id: string, @CurrentUser() user: User) {
    return this.advertisingService.pauseCampaign(id, user.id);
  }

  @Post('campaigns/:id/resume')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resume campaign' })
  async resumeCampaign(@Param('id') id: string, @CurrentUser() user: User) {
    return this.advertisingService.resumeCampaign(id, user.id);
  }

  @Post('campaigns/:id/end')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'End campaign' })
  async endCampaign(@Param('id') id: string, @CurrentUser() user: User) {
    return this.advertisingService.endCampaign(id, user.id);
  }

  // ---- ADS ----

  @Post('ads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an ad' })
  async createAd(@Body() dto: CreateAdDto, @CurrentUser() user: User) {
    return this.advertisingService.createAd(dto, user.id);
  }

  @Get('ads')
  @ApiOperation({ summary: 'Get ads by campaign' })
  async getAds(@Query('campaignId') campaignId: string, @Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.advertisingService.getAds(campaignId, { page, limit });
  }

  @Get('ads/:id')
  @ApiOperation({ summary: 'Get ad by ID' })
  async getAd(@Param('id') id: string) {
    return this.advertisingService.getAd(id);
  }

  @Patch('ads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ad' })
  async updateAd(@Param('id') id: string, @Body() dto: UpdateAdDto, @CurrentUser() user: User) {
    return this.advertisingService.updateAd(id, dto, user.id);
  }

  @Delete('ads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete ad' })
  async deleteAd(@Param('id') id: string, @CurrentUser() user: User) {
    await this.advertisingService.deleteAd(id, user.id);
  }

  // ---- PLACEMENTS ----

  @Get('placements')
  @ApiOperation({ summary: 'Get available placements' })
  async getPlacements() {
    return this.advertisingService.getAvailablePlacements();
  }

  // ---- ANALYTICS ----

  @Get('analytics/:id')
  @ApiOperation({ summary: 'Get campaign analytics' })
  async getCampaignAnalytics(@Param('id') id: string) {
    return this.advertisingService.getCampaignAnalytics(id);
  }

  // ---- TRACKING ----

  @Post('track/impression/:adId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record ad impression' })
  async recordImpression(@Param('adId') adId: string) {
    await this.advertisingService.recordImpression(adId);
  }

  @Post('track/click/:adId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Record ad click' })
  async recordClick(@Param('adId') adId: string) {
    await this.advertisingService.recordClick(adId);
  }
}
