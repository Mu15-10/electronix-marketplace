import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceRecognitionController } from './device-recognition.controller';
import { DeviceRecognitionService } from './device-recognition.service';
import { Device } from './entities/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [DeviceRecognitionController],
  providers: [DeviceRecognitionService],
  exports: [DeviceRecognitionService],
})
export class DeviceRecognitionModule {}
