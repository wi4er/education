import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Language } from './language.entity';
import { Attribute } from '../attribute/attribute.entity';
import { Point } from '../../../registry/entities/point/point.entity';
import { CommonPointEntity } from '../../../common/entities/common-point.entity';

@Entity('settings_language2point')
export class Language2Point
  extends BaseEntity
  implements CommonPointEntity<Language>
{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Language, (language: Language) => language.points, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Language;

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
