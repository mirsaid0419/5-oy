// src/modules/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { MailerService } from '@nestjs-modules/mailer';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly mailerService: MailerService,
    private readonly usersService: UsersService, 
  ) {}

  async signupStep1(email: string) {
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException("Bu email allaqachon ro'yxatdan o'tgan");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await this.redis.set(`otp:${email}`, otp, 'EX', 120);

    await this.mailerService.sendMail({
      to: email,
      subject: "Ro'yxatdan o'tishni tasdiqlang",
      html: `Sizning tasdiqlash kodingiz: <b>${otp}</b>`,
    });

    return { message: 'OTP emailga yuborildi' };
  }

  async signupStep2(email: string, otp: string, userData: any) {
    const storedOtp = await this.redis.get(`otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException("Kod noto'g'ri yoki muddati tugagan");
    }

    // OTP to'g'ri bo'lsa, foydalanuvchini bazaga qo'shamiz
    const newUser = await this.usersService.createUser({
      email: email,
      name: userData.name,
      password: userData.password, // Haqiqiy loyihada parolni bcrypt qilish shart!
    });

    // Muvaffaqiyatli bo'lsa, OTPni Redisdan o'chiramiz
    await this.redis.del(`otp:${email}`);

    return {
      message: 'Foydalanuvchi muvaffaqiyatli yaratildi',
      user: newUser,
    };
  }
}
