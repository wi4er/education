import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Measure} from './measure.entity';
import {Attribute} from '../../../settings/entities/attribute/attribute.entity';
import {Point} from '../point/point.entity';
import {CommonPointEntity} from '../../../common/entities/common-point.entity';

@Entity('registry_measure2point')
export class Measure2Point
  extends BaseEntity
  implements CommonPointEntity<Measure> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Measure,
    measure => measure.points,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Measure;

  @Column({ type: 'varchar', length: 36 })
  parentId: string;

  @ManyToOne(
    () => Attribute,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @Column({ type: 'varchar', length: 36 })
  attributeId: string;

  @ManyToOne(
    () => Point,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'pointId' })
  point: Point;

  @Column({ type: 'varchar', length: 36 })
  pointId: string;

}
