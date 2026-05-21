import { Injectable } from '@nestjs/common';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data');

@Injectable()
export class AiService {
  private readonly aiServiceUrl = process.env.PYTHON_AI_URL || 'http://localhost:8001';

  async getCoachingResponse(transcript: string) {
    const response = await axios.post(`${this.aiServiceUrl}/coaching/respond`, {
      transcript,
    });
    return response.data;
  }

  async transcribeAudio(audioBuffer: Buffer, mimetype: string, filename: string) {
    const form = new FormData();
    form.append('audio', audioBuffer, { filename, contentType: mimetype });

    const response = await axios.post(`${this.aiServiceUrl}/stt/transcribe`, form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });
    return response.data;
  }
}