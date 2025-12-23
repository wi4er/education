import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Directory } from './directory.entity';
import { Attribute } from '../../../settings/entities/attribute/attribute.entity';
import { Point } from '../point/point.entity';
import { CommonPointEntity } from '../../../common/entities/common-point.entity';

@Entity('registry_directory2point')
export class Directory2Point
  extends BaseEntity
  implements CommonPointEntity<Directory>
{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Directory, (directory: Directory) => directory.points, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Directory;

  @Column({ type: 'varchar', length: 32 })
  parentId: string;

  @ManyToOne(() => Attribute, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @Column({ type: 'varchar', length: 32 })
  attributeId: string;

  @ManyToOne(() => Point, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'pointId' })
  point: Point;

  @Column({ type: 'varchar', length: 32 })
  pointId: string;
}
