import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Language2String } from './language2string.entity';
import { Language2Point } from './language2point.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';

@Entity('settings_language')
export class Language
  implements WithStrings<Language>, WithPoints<Language> {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(
    () => Language2String,
    (langString) => langString.parent,
  )
  strings: Language2String[];

  @OneToMany(
    () => Language2Point,
    (langPoint) => langPoint.parent,
  )
  points: Language2Point[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
