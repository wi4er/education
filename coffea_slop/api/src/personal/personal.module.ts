import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user/user.entity';
import { User2Description } from './entities/user/user2description.entity';
import { User4Status } from './entities/user/user4status.entity';
import { Group } from './entities/group/group.entity';
import { Group2Description } from './entities/group/group2description.entity';
import { Group4Status } from './entities/group/group4status.entity';
import { Access } from './entities/access/access.entity';
import { UserController } from './controllers/user.controller';
import { GroupController } from './controllers/group.controller';
import { AccessController } from './controllers/access.controller';
import { SignInController } from './controllers/sign-in.controller';
import { MyselfController } from './controllers/myself.controller';
import { AuthCookieService } from './services/auth-cookie.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      User2Description,
      User4Status,
      Group,
      Group2Description,
      Group4Status,
      Access,
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'development-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    CommonModule,
  ],
  controllers: [
    UserController,
    GroupController,
    AccessController,
    SignInController,
    MyselfController,
  ],
  providers: [AuthCookieService],
})
export class PersonalModule {}
