import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Element} from './element.entity';
import {Attribute} from '../../../settings/entities/attribute/attribute.entity';
import {Point} from '../../../registry/entities/point/point.entity';
import {CommonPointEntity} from '../../../common/entities/common-point.entity';

@Entity('content_element2point')
export class Element2Point
  extends BaseEntity
  implements CommonPointEntity<Element> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Element,
    (element: Element) => element.points,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Element;

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
