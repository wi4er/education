import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Point2String } from './point2string.entity';
import { Point2Point } from './point2point.entity';
import { Point4Status } from './point4status.entity';
import { Directory } from '../directory/directory.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithStatuses } from '../../../common/entities/with-statuses.entity';

@Entity('registry_point')
export class Point
  extends BaseEntity
  implements WithStrings<Point>, WithPoints<Point>, WithStatuses<Point>
{
  @PrimaryColumn({
    type: 'varchar',
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @ManyToOne(() => Directory, (directory: Directory) => directory.points, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'directoryId' })
  directory: Directory;

  @Column({ type: 'varchar', length: 36 })
  directoryId: string;

  @OneToMany(
    () => Point2String,
    (pointString: Point2String) => pointString.parent,
  )
  strings: Point2String[];

  @OneToMany(() => Point2Point, (pointPoint: Point2Point) => pointPoint.parent)
  points: Point2Point[];

  @OneToMany(
    () => Point4Status,
    (pointStatus: Point4Status) => pointStatus.parent,
  )
  statuses: Point4Status[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
