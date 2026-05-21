import { Module } from '@nestjs/common';
import { VoiceGateway } from './voice.gateway';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  providers: [VoiceGateway],
})
export class WebsocketModule {}