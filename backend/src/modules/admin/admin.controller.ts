import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard stats' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user management data' })
  async getUsers(
    @Query('status') status?: string,
    @Query('role') role?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getUserManagementData({ status, role }, { page, limit });
  }

  @Get('listings')
  @ApiOperation({ summary: 'Get listing management data' })
  async getListings(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getListingManagementData({ status }, { page, limit });
  }

  @Get('disputes')
  @ApiOperation({ summary: 'Get disputes data' })
  async getDisputes(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.getDisputesData({ status }, { page, limit });
  }

  @Get('verifications')
  @ApiOperation({ summary: 'Get verification queue' })
  async getVerifications() {
    return this.adminService.getVerificationQueue();
  }

  @Get('moderation')
  @ApiOperation({ summary: 'Get moderation queue' })
  async getModeration() {
    return this.adminService.getModerationQueue();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.adminService.getAuditLogs({ action, userId }, { page, limit });
  }

  @Get('security')
  @ApiOperation({ summary: 'Get security alerts' })
  async getSecurityAlerts() {
    return this.adminService.getSecurityAlerts();
  }

  @Get('system-health')
  @ApiOperation({ summary: 'Get system health status' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }
}
