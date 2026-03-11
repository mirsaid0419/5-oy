import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    return this.authService.signupStep1(email);
  }

  @Post('verify-signup')
  async verifyAndSignup(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('userData') userData: any,
  ) {
    return this.authService.signupStep2(email, otp, userData);
  }
}
