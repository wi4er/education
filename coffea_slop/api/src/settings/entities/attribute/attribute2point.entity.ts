import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Attribute } from './attribute.entity';
import { Point } from '../../../registry/entities/point/point.entity';
import { CommonPointEntity } from '../../../common/entities/common-point.entity';

@Entity('settings_attribute2point')
export class Attribute2Point
  extends BaseEntity
  implements CommonPointEntity<Attribute>
{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Attribute, (attribute: Attribute) => attribute.points, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Attribute;

  @Column({ type: 'varchar', length: 36 })
  parentId: string;

  @ManyToOne(() => Attribute, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @Column({ type: 'varchar', length: 36 })
  attributeId: string;

  @ManyToOne(() => Point, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'pointId' })
  point: Point;

  @Column({ type: 'varchar', length: 36 })
  pointId: string;
}
