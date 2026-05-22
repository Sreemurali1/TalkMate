import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ email });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepo.findOneBy({ googleId });
  }

  /**
   * Find an existing user by Google ID or email, or create a new one.
   * Called by the Google OAuth strategy after a successful login.
   */
  async findOrCreate(profile: {
    googleId: string;
    email: string;
    name?: string;
    avatarUrl?: string;
  }): Promise<User> {
    let user = await this.findByGoogleId(profile.googleId);
    if (user) return user;

    // Merge with an existing email-only account if present
    user = await this.findByEmail(profile.email);
    if (user) {
      user.googleId = profile.googleId;
      if (profile.name) user.name = profile.name;
      if (profile.avatarUrl) user.avatarUrl = profile.avatarUrl;
      return this.usersRepo.save(user);
    }

    const newUser = this.usersRepo.create({
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    });
    return this.usersRepo.save(newUser);
  }

  async getProfile(id: string): Promise<Partial<User> | null> {
    const user = await this.findById(id);
    if (!user) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { googleId, ...safe } = user;
    return safe;
  }
}
