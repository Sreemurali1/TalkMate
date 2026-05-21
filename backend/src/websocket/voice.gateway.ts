import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AiService } from '../ai/ai.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    allowedHeaders: ['Content-Type', 'ngrok-skip-browser-warning'],
  },
})
export class VoiceGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly aiService: AiService) {}

  @SubscribeMessage('transcript')
  async handleTranscript(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const response = await this.aiService.getCoachingResponse(data.text);
      client.emit('ai_response', response);
    } catch (error) {
      client.emit('error', { message: 'AI service error' });
    }
  }
}