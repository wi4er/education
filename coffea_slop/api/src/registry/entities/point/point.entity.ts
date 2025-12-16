import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Point2String } from './point2string.entity';
import { Point2Point } from './point2point.entity';
import { Directory } from '../directory/directory.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';

@Entity('registry_point')
export class Point
  implements WithStrings<Point>, WithPoints<Point> {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @ManyToOne(
    () => Directory,
    (directory: Directory) => directory.points,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'directoryId' })
  directory: Directory;

  @Column({ type: 'varchar', length: 32 })
  directoryId: string;

  @OneToMany(
    () => Point2String,
    (pointString: Point2String) => pointString.parent,
  )
  strings: Point2String[];

  @OneToMany(
    () => Point2Point,
    (pointPoint: Point2Point) => pointPoint.parent,
  )
  points: Point2Point[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
