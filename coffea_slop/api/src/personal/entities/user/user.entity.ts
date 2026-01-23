import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
  BaseEntity,
  Check,
} from 'typeorm';
import { User2String } from './user2string.entity';
import { User2Point } from './user2point.entity';
import { User2Description } from './user2description.entity';
import { User2Counter } from './user2counter.entity';
import { User2File } from './user2file.entity';
import { User4Image } from './user4image.entity';
import { User4Group } from './user4group.entity';
import { User4Status } from './user4status.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithDescriptions } from '../../../common/entities/with-descriptions.entity';
import { WithStatuses } from '../../../common/entities/with-statuses.entity';
import { WithFiles } from '../../../common/entities/with-files.entity';

@Entity('personal_user')
@Check('"id" <> \'\'')
export class User
  extends BaseEntity
  implements WithStrings<User>,
    WithPoints<User>,
    WithDescriptions<User>,
    WithStatuses<User>,
    WithFiles<User> {

  @PrimaryColumn({
    type: 'varchar',
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  login?: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  password?: string;

  @Column({ type: 'varchar', length: 256, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 36, nullable: true })
  phone?: string;

  @OneToMany(
    () => User2String,
    (string: User2String) => string.parent,
  )
  strings: User2String[];

  @OneToMany(
    () => User2Point,
    (point: User2Point) => point.parent,
  )
  points: User2Point[];

  @OneToMany(
    () => User2Description,
    (description: User2Description) => description.parent,
  )
  descriptions: User2Description[];

  @OneToMany(
    () => User4Group,
    (group: User4Group) => group.user,
  )
  groups: User4Group[];

  @OneToMany(
    () => User2Counter,
    (userCounter: User2Counter) => userCounter.parent,
  )
  counters: User2Counter[];

  @OneToMany(
    () => User2File,
    (userFile: User2File) => userFile.parent,
  )
  files: User2File[];

  @OneToMany(
    () => User4Image,
    (userImage: User4Image) => userImage.parent,
  )
  images: User4Image[];

  @OneToMany(
    () => User4Status,
    (userStatus: User4Status) => userStatus.parent,
  )
  statuses: User4Status[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
