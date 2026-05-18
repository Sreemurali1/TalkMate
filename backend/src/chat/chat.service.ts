import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  async getAIResponse(message: string): Promise<string> {
    const response = await fetch('http://localhost:8002/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    return data.reply;
  }
}