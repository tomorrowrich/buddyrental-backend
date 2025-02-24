import { MiddlewareConsumer, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { SupabaseModule } from 'nestjs-supabase-js';
import { LoggerMiddleware } from '@app/middleware/logger.middleware';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [SupabaseModule.injectClient(), JwtModule],
  controllers: [StorageController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(StorageController);
  }
}
