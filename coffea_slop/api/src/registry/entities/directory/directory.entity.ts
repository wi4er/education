import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Directory2String } from './directory2string.entity';
import { Directory2Point } from './directory2point.entity';
import { Directory4Permission } from './directory4permission.entity';
import { Directory4Status } from './directory4status.entity';
import { Point } from '../point/point.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithStatuses } from '../../../common/entities/with-statuses.entity';

@Entity('registry_directory')
export class Directory
  extends BaseEntity
  implements
    WithStrings<Directory>,
    WithPoints<Directory>,
    WithStatuses<Directory>
{
  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(
    () => Directory2String,
    (dirString: Directory2String) => dirString.parent,
  )
  strings: Directory2String[];

  @OneToMany(
    () => Directory2Point,
    (dirPoint: Directory2Point) => dirPoint.parent,
  )
  points: Directory2Point[];

  @OneToMany(
    () => Directory4Permission,
    (dirPermission: Directory4Permission) => dirPermission.parent,
  )
  permissions: Directory4Permission[];

  @OneToMany(
    () => Directory4Status,
    (dirStatus: Directory4Status) => dirStatus.parent,
  )
  statuses: Directory4Status[];

  @OneToMany(() => Point, (point: Point) => point.directory)
  children: Point[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
