import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async getProgress(userId: string) {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) return { totalSessions: 0, streak: 0, minutesSpoken: 0 };

    return {
      totalSessions: user.totalSessions,
      streak: user.streak,
      minutesSpoken: user.totalMinutes,
    };
  }

  async getStreak(userId: string): Promise<number> {
    const user = await this.usersRepo.findOneBy({ id: userId });
    return user?.streak ?? 0;
  }
}
