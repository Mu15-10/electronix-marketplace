import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InspectionService } from './inspection.service';
import { ScheduleInspectionDto } from './dto/schedule-inspection.dto';
import { CompleteInspectionDto } from './dto/complete-inspection.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Inspections')
@Controller('inspections')
export class InspectionController {
  constructor(private readonly inspectionService: InspectionService) {}

  @Post('schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Schedule an inspection (admin)' })
  async schedule(@Body() dto: ScheduleInspectionDto) {
    return this.inspectionService.scheduleInspection(dto);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Start an inspection (admin)' })
  async start(@Param('id') id: string) {
    return this.inspectionService.startInspection(id);
  }

  @Post(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete an inspection with results (admin)' })
  async complete(@Param('id') id: string, @Body() dto: CompleteInspectionDto) {
    return this.inspectionService.completeInspection(id, dto);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pending inspections (admin)' })
  async getPending() {
    return this.inspectionService.getPendingInspections();
  }

  @Get('listing/:listingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get inspections for a listing' })
  async getListingInspections(@Param('listingId') listingId: string) {
    return this.inspectionService.getListingInspections(listingId);
  }

  @Get('inspector/:inspectorId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get inspector schedule' })
  async getInspectorSchedule(@Param('inspectorId') inspectorId: string) {
    return this.inspectionService.getInspectorSchedule(inspectorId);
  }

  @Post(':id/verify-badge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify inspection badge (admin)' })
  async verifyBadge(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inspectionService.verifyBadge(id, user.id);
  }

  @Get('certificate/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate inspection certificate' })
  async getCertificate(@Param('id') id: string) {
    return this.inspectionService.generateCertificate(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get inspection details' })
  async getInspection(@Param('id') id: string) {
    return this.inspectionService.getInspection(id);
  }
}
