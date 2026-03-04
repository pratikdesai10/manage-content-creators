import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CreatorController } from './creator.controller';
import { CreatorService } from './creator.service';

@Module({
  imports: [AuthModule],
  controllers: [CreatorController],
  providers: [CreatorService],
  exports: [CreatorService],
})
export class CreatorModule {}
