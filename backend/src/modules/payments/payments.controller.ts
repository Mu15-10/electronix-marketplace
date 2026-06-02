import { Controller, Get, Post, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payment intent' })
  async createIntent(@Body() dto: CreatePaymentIntentDto, @CurrentUser() user: User) {
    return this.paymentsService.createPaymentIntent(dto.amount, dto.currency || 'usd', dto.metadata || {}, user.id);
  }

  @Post('confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm payment' })
  async confirm(@Body('paymentIntentId') paymentIntentId: string) {
    return this.paymentsService.confirmPayment(paymentIntentId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async webhook(@Req() req: Request) {
    await this.paymentsService.webhookHandler(req.body);
    return { received: true };
  }

  @Get('methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment methods' })
  async getMethods(@CurrentUser() user: User) {
    return this.paymentsService.getPaymentMethods(user.id);
  }

  @Post('methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add payment method' })
  async addMethod(@Body() dto: any, @CurrentUser() user: User) {
    return this.paymentsService.addPaymentMethod(user.id, dto);
  }

  @Delete('methods/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove payment method' })
  async removeMethod(@Param('id') id: string, @CurrentUser() user: User) {
    await this.paymentsService.removePaymentMethod(user.id, id);
    return { message: 'Payment method removed' };
  }
}
