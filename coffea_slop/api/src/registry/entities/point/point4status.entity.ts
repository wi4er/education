import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Point } from './point.entity';
import { Status } from '../../../settings/entities/status/status.entity';

@Entity('registry_point4status')
export class Point4Status extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Point,
    (point: Point) => point.statuses,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Point;

  @Column({ type: 'varchar', length: 32 })
  parentId: string;

  @ManyToOne(
    () => Status,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @Column({ type: 'varchar', length: 32 })
  statusId: string;

}
