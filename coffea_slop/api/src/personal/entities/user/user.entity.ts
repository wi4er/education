import {
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User2String } from './user2string.entity';
import { User2Point } from './user2point.entity';
import { User2Description } from './user2description.entity';
import { User4Group } from './user4group.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithDescriptions } from '../../../common/entities/with-descriptions.entity';

@Entity('personal_user')
export class User
  implements WithStrings<User>, WithPoints<User>, WithDescriptions<User> {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
