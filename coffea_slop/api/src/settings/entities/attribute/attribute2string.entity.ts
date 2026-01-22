import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Attribute} from './attribute.entity';
import {Language} from '../language/language.entity';
import {CommonStringEntity} from '../../../common/entities/common-string.entity';

@Entity('settings_attribute2string')
export class Attribute2String
  extends BaseEntity
  implements CommonStringEntity<Attribute> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Attribute, (attribute: Attribute) => attribute.strings, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Attribute;

  @Column({ type: 'varchar', length: 36 })
  parentId: string;

  @ManyToOne(() => Language, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'languageId' })
  language: Language | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  languageId: string | null;

  @ManyToOne(() => Attribute, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @Column({ type: 'varchar', length: 36 })
  attributeId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  value: string;

}
