import { Controller, Post, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('run')
  @ApiOperation({ summary: 'Seed the database with sample data' })
  @ApiQuery({ name: 'key', required: true, description: 'Seed key from SEED_KEY env, or any key if SEED_KEY not set' })
  async run(@Query('key') key: string) {
    const expectedKey = process.env.SEED_KEY || 'seed-dev';
    if (!key || key !== expectedKey) {
      throw new BadRequestException('Invalid seed key');
    }
    return this.seedService.run();
  }

  @Post('reset')
  @ApiOperation({ summary: 'Reset and re-seed the database' })
  @ApiQuery({ name: 'key', required: true })
  async reset(@Query('key') key: string) {
    const expectedKey = process.env.SEED_KEY || 'seed-dev';
    if (!key || key !== expectedKey) {
      throw new BadRequestException('Invalid seed key');
    }
    return this.seedService.reset();
  }
}
