import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { SubmitIdentityDto } from './dto/submit-identity.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { VerificationType } from './entities/verification.entity';

@ApiTags('Verification')
@Controller('verification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('identity')
  @ApiOperation({ summary: 'Submit identity document for verification' })
  async submitIdentity(@Body() dto: SubmitIdentityDto, @CurrentUser() user: User) {
    return this.verificationService.submitIdentityDocument(user.id, dto);
  }

  @Post('face')
  @ApiOperation({ summary: 'Submit face match verification' })
  async submitFace(@Body('selfieImage') selfieImage: string, @CurrentUser() user: User) {
    return this.verificationService.verifyFaceMatch(user.id, selfieImage);
  }

  @Post('business')
  @ApiOperation({ summary: 'Submit business verification' })
  async submitBusiness(@Body() dto: any, @CurrentUser() user: User) {
    return this.verificationService.verifyBusiness(user.id, dto);
  }

  @Post('liveness')
  @ApiOperation({ summary: 'Submit liveness check' })
  async submitLiveness(@Body('videoData') videoData: string, @CurrentUser() user: User) {
    return this.verificationService.checkLiveness(user.id, videoData);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get verification status' })
  async getStatus(@CurrentUser() user: User) {
    return this.verificationService.getVerificationStatus(user.id);
  }

  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Get pending verifications (admin)' })
  async getPending(@Query('page') page: number = 1, @Query('limit') limit: number = 20) {
    return this.verificationService.getPendingVerifications({ page, limit });
  }

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Approve verification (admin)' })
  async approve(@Param('id') id: string, @Query('type') type: VerificationType, @CurrentUser() user: User) {
    return this.verificationService.approveVerification(id, type, user.id);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Reject verification (admin)' })
  async reject(@Param('id') id: string, @Query('type') type: VerificationType, @Body('reason') reason: string, @CurrentUser() user: User) {
    return this.verificationService.rejectVerification(id, type, reason, user.id);
  }
}
