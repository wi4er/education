import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user/user.entity';
import { User2Description } from './entities/user/user2description.entity';
import { Group } from './entities/group/group.entity';
import { Group2Description } from './entities/group/group2description.entity';
import { Access } from './entities/access/access.entity';
import { UserController } from './controllers/user.controller';
import { GroupController } from './controllers/group.controller';
import { AccessController } from './controllers/access.controller';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, User2Description, Group, Group2Description, Access]),
    CommonModule,
  ],
  controllers: [
    UserController,
    GroupController,
    AccessController,
  ],
})
export class PersonalModule {}
