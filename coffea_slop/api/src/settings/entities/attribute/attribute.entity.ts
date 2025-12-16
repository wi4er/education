import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Attribute2String } from './attribute2string.entity';
import { Attribute2Point } from './attribute2point.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';

@Entity('settings_attribute')
export class Attribute
  implements WithStrings<Attribute>, WithPoints<Attribute> {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()'
  })
  id: string;

  @OneToMany(
    () => Attribute2String,
    (attrString: Attribute2String) => attrString.parent,
  )
  strings: Attribute2String[];

  @OneToMany(
    () => Attribute2Point,
    (attrPoint: Attribute2Point) => attrPoint.parent,
  )
  points: Attribute2Point[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
