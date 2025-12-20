import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from '../common/guards/jwt.guard';
import { RtGuard } from '../common/guards/rt.guard';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.service.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }

  // ✅ Refresh token comes from Authorization: Bearer <refresh_token>
  @UseGuards(RtGuard)
  @Post('refresh')
  refresh(@Req() req: any) {
    return this.service.refresh(req.user.id, req.user.refreshToken);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  logout(@Req() req: any) {
    return this.service.logout(req.user.id);
  }
}
