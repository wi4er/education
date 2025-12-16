import {
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group2String } from './group2string.entity';
import { Group2Point } from './group2point.entity';
import { Group2Description } from './group2description.entity';
import { User4Group } from '../user/user4group.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithDescriptions } from '../../../common/entities/with-descriptions.entity';

@Entity('personal_group')
export class Group
  implements WithStrings<Group>, WithPoints<Group>, WithDescriptions<Group> {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(
    () => Group2String,
    (groupString) => groupString.parent,
  )
  strings: Group2String[];

  @OneToMany(
    () => Group2Point,
    (groupPoint: Group2Point) => groupPoint.parent,
  )
  points: Group2Point[];

  @OneToMany(
    () => Group2Description,
    (groupDescription: Group2Description) => groupDescription.parent,
  )
  descriptions: Group2Description[];

  @OneToMany(
    () => User4Group,
    (user4group: User4Group) => user4group.group,
  )
  users: User4Group[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
