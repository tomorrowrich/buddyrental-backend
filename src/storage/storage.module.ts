import { MiddlewareConsumer, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { SupabaseModule } from 'nestjs-supabase-js';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '@app/prisma/prisma.service';
import { AuthModule } from '@app/auth/auth.module';

@Module({
  imports: [
    SupabaseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const supabaseUrl = configService.get<string>('storage.url')!;
        const supabaseKey = configService.get<string>('storage.key')!;
        return {
          supabaseUrl,
          supabaseKey,
        };
      },
    }),
    SupabaseModule.injectClient(),
    JwtModule,
    AuthModule,
  ],
  controllers: [StorageController],
  providers: [
    StorageService,
    PrismaService,
    {
      provide: 'STORAGE_BUCKET',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('storage.bucket') || 'storage',
      inject: [ConfigService],
    },
  ],
  exports: [StorageService],
})
export class StorageModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(StorageController);
  }
}
