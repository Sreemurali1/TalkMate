import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionsService, CreateSessionDto } from './sessions.service';
import type { UpdateSessionDto } from './sessions.service';

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Req() req: AuthRequest, @Body() body: Omit<CreateSessionDto, 'userId'>) {
    return this.sessionsService.create({ ...body, userId: req.user.id });
  }

  @Get()
  findAll(@Req() req: AuthRequest) {
    return this.sessionsService.findAllForUser(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.sessionsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() body: UpdateSessionDto,
  ) {
    return this.sessionsService.update(id, req.user.id, body);
  }
}
