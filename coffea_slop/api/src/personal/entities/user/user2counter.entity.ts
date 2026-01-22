import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {User} from './user.entity';
import {Attribute} from '../../../settings/entities/attribute/attribute.entity';
import {Point} from '../../../registry/entities/point/point.entity';
import {Measure} from '../../../registry/entities/measure/measure.entity';

@Entity('personal_user2counter')
export class User2Counter
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => User,
    (user: User) => user.counters,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: User;

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
      nullable: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'pointId' })
  point: Point | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  pointId: string | null;

  @ManyToOne(
    () => Measure,
    {
      nullable: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'measureId' })
  measure: Measure | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  measureId: string | null;

  @Column({ type: 'float' })
  count: number;

}
