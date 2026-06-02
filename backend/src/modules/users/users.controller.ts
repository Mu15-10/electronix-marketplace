import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.getDashboardData(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    const { passwordHash, refreshToken, twoFactorSecret, twoFactorBackupCodes, ...safeUser } = user;
    return safeUser;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (admin)' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getUsers(
    @Query('q') q: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    if (q) return this.usersService.searchUsers(q, { page, limit });
    return this.usersService.getStatistics();
  }

  @Patch(':id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Suspend a user (admin)' })
  async suspendUser(@Param('id') id: string, @Body('reason') reason: string) {
    return this.usersService.suspendUser(id, reason);
  }

  @Patch(':id/reactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reactivate a user (admin)' })
  async reactivateUser(@Param('id') id: string) {
    return this.usersService.reactivateUser(id);
  }

  @Get(':id/listings')
  @ApiOperation({ summary: 'Get user listings' })
  async getUserListings(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return user.listings || [];
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get user reviews' })
  async getUserReviews(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return user.reviewsReceived || [];
  }
}
