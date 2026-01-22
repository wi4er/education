import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Block} from './block.entity';
import {Attribute} from '../../../settings/entities/attribute/attribute.entity';
import {Point} from '../../../registry/entities/point/point.entity';
import {CommonPointEntity} from '../../../common/entities/common-point.entity';

@Entity('content_block2point')
export class Block2Point
  extends BaseEntity
  implements CommonPointEntity<Block> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Block,
    (block: Block) => block.points,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Block;

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
