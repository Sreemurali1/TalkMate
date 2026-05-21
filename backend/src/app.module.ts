import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WebsocketModule } from './websocket/websocket.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WebsocketModule,
    AiModule,
  ],
})
export class AppModule {}