import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Directory2String } from './directory2string.entity';
import { Directory2Point } from './directory2point.entity';
import { Directory2Permission } from './directory2permission.entity';
import { Point } from '../point/point.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';

@Entity('registry_directory')
export class Directory
  implements WithStrings<Directory>, WithPoints<Directory> {

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
    () => Directory2Permission,
    (dirPermission: Directory2Permission) => dirPermission.parent,
  )
  permissions: Directory2Permission[];

  @OneToMany(
    () => Point,
    (point: Point) => point.directory,
  )
  children: Point[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
