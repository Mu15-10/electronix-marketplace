import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SupportService } from './support.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { AddMessageDto } from './dto/add-message.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, UserRole } from '../users/entities/user.entity';
import { SenderRole } from './entities/ticket-message.entity';

@ApiTags('Support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // ---- TICKETS ----

  @Post('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a support ticket' })
  async createTicket(@Body() dto: CreateTicketDto, @CurrentUser() user: User) {
    return this.supportService.createTicket(dto, user.id);
  }

  @Get('tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user tickets' })
  async getUserTickets(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.supportService.getUserTickets(user.id, { page, limit });
  }

  @Get('tickets/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket by ID' })
  async getTicket(@Param('id') id: string) {
    return this.supportService.getTicket(id);
  }

  @Post('tickets/:id/messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add message to ticket' })
  async addMessage(
    @Param('id') id: string,
    @Body() dto: AddMessageDto,
    @CurrentUser() user: User,
  ) {
    const senderRole = user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN
      ? SenderRole.ADMIN : SenderRole.USER;
    return this.supportService.addMessage(id, user.id, senderRole, dto);
  }

  @Patch('tickets/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ticket status (admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateTicketStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.supportService.updateStatus(id, dto.status, user.id);
  }

  @Patch('tickets/:id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign ticket to agent (admin)' })
  async assignTicket(@Param('id') id: string, @Body() dto: AssignTicketDto) {
    return this.supportService.assignTicket(id, dto.agentId);
  }

  @Post('tickets/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve ticket (admin)' })
  async resolveTicket(
    @Param('id') id: string,
    @Body('resolution') resolution: string,
    @CurrentUser() user: User,
  ) {
    return this.supportService.resolveTicket(id, user.id, resolution);
  }

  @Post('tickets/:id/rate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rate ticket' })
  async rateTicket(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @CurrentUser() user: User,
  ) {
    return this.supportService.rateTicket(id, user.id, rating);
  }

  // ---- FAQS ----

  @Get('faqs')
  @ApiOperation({ summary: 'Get FAQs' })
  async getFAQs(
    @Query('category') category?: string,
    @Query('language') language?: string,
  ) {
    return this.supportService.getFAQs(category, language);
  }

  @Post('faqs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create FAQ (admin)' })
  async createFAQ(@Body() dto: CreateFaqDto) {
    return this.supportService.createFAQ(dto);
  }

  @Patch('faqs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update FAQ (admin)' })
  async updateFAQ(@Param('id') id: string, @Body() dto: UpdateFaqDto) {
    return this.supportService.updateFAQ(id, dto);
  }

  @Delete('faqs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete FAQ (admin)' })
  async deleteFAQ(@Param('id') id: string) {
    await this.supportService.deleteFAQ(id);
  }

  @Get('faqs/search')
  @ApiOperation({ summary: 'Search FAQs' })
  async searchFAQs(@Query('q') query: string, @Query('language') language?: string) {
    return this.supportService.searchFAQs(query, language);
  }

  // ---- STATISTICS ----

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get ticket statistics (admin)' })
  async getStatistics() {
    return this.supportService.getTicketStatistics();
  }
}
