import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

interface GoogleRequest extends Request {
  user: User;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
  ) {}

  /** Step 1 – redirect the browser to Google's consent screen */
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleLogin() {
    // Passport handles the redirect; nothing to return here.
  }

  /** Step 2 – Google redirects back here after the user consents */
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  googleCallback(@Req() req: GoogleRequest, @Res() res: Response) {
    const { accessToken } = this.authService.login(req.user);
    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    // Pass the token to the frontend via query param; the frontend stores it.
    res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
  }

  /** Convenience endpoint – verify a JWT and return the current user payload */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: Request & { user: { id: string; email: string } }) {
    return req.user;
  }

  /**
   * Called by the Next.js frontend (server-side) to exchange a Google profile
   * for a backend JWT without going through the browser redirect flow.
   */
  @Post('google/token')
  async googleToken(
    @Body()
    body: {
      googleId: string;
      email: string;
      name?: string;
      avatarUrl?: string;
    },
  ) {
    const user = await this.usersService.findOrCreate(body);
    return this.authService.login(user);
  }
}
