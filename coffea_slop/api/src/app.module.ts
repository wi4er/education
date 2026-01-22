import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsModule } from './settings/settings.module';
import { RegistryModule } from './registry/registry.module';
import { PersonalModule } from './personal/personal.module';
import { ContentModule } from './content/content.module';
import { ExceptionModule } from './exception/exception.module';
import { FeedbackModule } from './feedback/feedback.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    SettingsModule,
    RegistryModule,
    PersonalModule,
    ContentModule,
    ExceptionModule,
    FeedbackModule,
    StorageModule,
  ],
})
export class AppModule {}
