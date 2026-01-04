import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Status2String } from './status2string.entity';
import { Status2Point } from './status2point.entity';
import { Status4Status } from './status4status.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithStatuses } from '../../../common/entities/with-statuses.entity';

@Entity('settings_status')
export class Status
  extends BaseEntity
  implements WithStrings<Status>, WithPoints<Status>, WithStatuses<Status>
{
  @PrimaryColumn({
    type: 'varchar',
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  icon: string | null;

  @Column({ type: 'varchar', length: 7, nullable: true })
  color: string | null;

  @OneToMany(
    () => Status2String,
    (statusString: Status2String) => statusString.parent,
  )
  strings: Status2String[];

  @OneToMany(
    () => Status2Point,
    (statusPoint: Status2Point) => statusPoint.parent,
  )
  points: Status2Point[];

  @OneToMany(
    () => Status4Status,
    (statusStatus: Status4Status) => statusStatus.parent,
  )
  statuses: Status4Status[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
