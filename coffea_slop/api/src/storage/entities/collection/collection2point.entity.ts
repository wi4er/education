import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity } from 'typeorm';
import { Collection } from './collection.entity';
import { Attribute } from '../../../settings/entities/attribute/attribute.entity';
import { Point } from '../../../registry/entities/point/point.entity';
import { CommonPointEntity } from '../../../common/entities/common-point.entity';

@Entity('storage_collection2point')
export class Collection2Point
  extends BaseEntity
  implements CommonPointEntity<Collection> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Collection,
    collection => collection.points,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Collection;

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

