import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Measure2String } from './measure2string.entity';
import { Measure2Point } from './measure2point.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';

@Entity('registry_measure')
export class Measure
  extends BaseEntity
  implements WithStrings<Measure>, WithPoints<Measure> {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(
    () => Measure2String,
    (measureString: Measure2String) => measureString.parent,
  )
  strings: Measure2String[];

  @OneToMany(
    () => Measure2Point,
    (measurePoint: Measure2Point) => measurePoint.parent,
  )
  points: Measure2Point[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
