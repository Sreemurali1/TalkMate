import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [
    MulterModule.register({ storage: undefined }), // use memory storage (buffer)
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
