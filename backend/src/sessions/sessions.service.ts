import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { User } from '../users/user.entity';

export interface CreateSessionDto {
  userId: string;
  scenario?: string;
  duration: number;
  transcript?: string;
  fluencyScore?: number | null;
  confidenceScore?: number | null;
  pronunciationScore?: number | null;
}

export interface UpdateSessionDto {
  fluencyScore?: number | null;
  confidenceScore?: number | null;
  pronunciationScore?: number | null;
}

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepo: Repository<Session>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateSessionDto): Promise<Session> {
    const session = this.sessionsRepo.create({
      userId: dto.userId,
      scenario: dto.scenario ?? 'free',
      duration: dto.duration,
      transcript: dto.transcript ?? null,
      fluencyScore: dto.fluencyScore ?? null,
      confidenceScore: dto.confidenceScore ?? null,
      pronunciationScore: dto.pronunciationScore ?? null,
    });

    const saved = await this.sessionsRepo.save(session);

    // Update user stats after saving the session
    await this.updateUserStats(dto.userId, dto.duration);

    return saved;
  }

  async findAllForUser(userId: string): Promise<Session[]> {
    return this.sessionsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Session> {
    const session = await this.sessionsRepo.findOne({
      where: { id, userId },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  async update(id: string, userId: string, dto: UpdateSessionDto): Promise<Session> {
    const session = await this.findOne(id, userId);
    Object.assign(session, dto);
    return this.sessionsRepo.save(session);
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async updateUserStats(userId: string, durationSeconds: number): Promise<void> {
    const user = await this.usersRepo.findOneBy({ id: userId });
    if (!user) return;

    const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    // Streak logic
    if (!user.lastSessionDate) {
      // First ever session
      user.streak = 1;
    } else {
      const last = new Date(user.lastSessionDate);
      const today = new Date(todayStr);
      const diffDays = Math.round(
        (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) {
        // Already practiced today — streak unchanged
      } else if (diffDays === 1) {
        // Consecutive day — extend streak
        user.streak += 1;
      } else {
        // Gap — reset streak
        user.streak = 1;
      }
    }

    user.lastSessionDate = todayStr;
    user.totalSessions += 1;
    user.totalMinutes += Math.round(durationSeconds / 60);

    await this.usersRepo.save(user);
  }
}
