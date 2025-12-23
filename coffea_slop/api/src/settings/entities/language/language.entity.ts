import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Language2String } from './language2string.entity';
import { Language2Point } from './language2point.entity';
import { Language4Status } from './language4status.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithStatuses } from '../../../common/entities/with-statuses.entity';

@Entity('settings_language')
export class Language
  extends BaseEntity
  implements WithStrings<Language>, WithPoints<Language>, WithStatuses<Language>
{
  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(() => Language2String, (langString) => langString.parent)
  strings: Language2String[];

  @OneToMany(() => Language2Point, (langPoint) => langPoint.parent)
  points: Language2Point[];

  @OneToMany(
    () => Language4Status,
    (langStatus: Language4Status) => langStatus.parent,
  )
  statuses: Language4Status[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
