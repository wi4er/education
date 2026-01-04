import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { Group } from './group.entity';
import { Language } from '../../../settings/entities/language/language.entity';
import { Attribute } from '../../../settings/entities/attribute/attribute.entity';
import { CommonStringEntity } from '../../../common/entities/common-string.entity';

@Entity('personal_group2string')
export class Group2String
  extends BaseEntity
  implements CommonStringEntity<Group>
{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, (group) => group.strings, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Group;

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

  @Column({ type: 'varchar', length: 255, default: '' })
  value: string;
}
