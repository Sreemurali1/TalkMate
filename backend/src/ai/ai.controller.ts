import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';

@Controller('stt')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('transcribe')
  @UseInterceptors(FileInterceptor('audio'))
  async transcribe(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No audio file provided');
    }
    return this.aiService.transcribeAudio(file.buffer, file.mimetype, file.originalname);
  }
}
