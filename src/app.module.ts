import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './core/db/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        transport: {
          port: 465,
          secure: true, // true for 465, false for other ports
          auth: {
            user: config.get('EMAIL_USER'),
            pass: config.get('EMAIL_PASS'), // Gmail App Password
          },
        },
        defaults: {
          from: '"No Reply" <no-reply@example.com>',
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: 'redis://127.0.0.1:6379',
      }),
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
