import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Measure } from './measure.entity';
import { Language } from '../../../settings/entities/language/language.entity';
import { Attribute } from '../../../settings/entities/attribute/attribute.entity';
import { CommonStringEntity } from '../../../common/entities/common-string.entity';

@Entity('registry_measure2string')
export class Measure2String extends BaseEntity
  implements CommonStringEntity<Measure> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Measure,
    (measure: Measure) => measure.strings,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Measure;

  @Column({ type: 'varchar', length: 32 })
  parentId: string;

  @ManyToOne(
    () => Language,
    {
      nullable: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'languageId' })
  language: Language | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  languageId: string | null;

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

  @Column({ type: 'varchar', length: 32 })
  attributeId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  value: string;

}
