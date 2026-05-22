import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalyticsService } from './analytics.service';

interface AuthRequest extends Request {
  user: { id: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('progress')
  getProgress(@Req() req: AuthRequest) {
    return this.analyticsService.getProgress(req.user.id);
  }

  @Get('streak')
  async getStreak(@Req() req: AuthRequest) {
    const streak = await this.analyticsService.getStreak(req.user.id);
    return { streak };
  }
}
