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
import { CommonDescriptionEntity } from '../../../common/entities/common-description.entity';

@Entity('personal_group2description')
export class Group2Description
  extends BaseEntity
  implements CommonDescriptionEntity<Group>
{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, (group: Group) => group.descriptions, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Group;

  @Column({ type: 'varchar', length: 32 })
  parentId: string;

  @ManyToOne(() => Language, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'languageId' })
  language: Language | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  languageId: string | null;

  @ManyToOne(() => Attribute, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @Column({ type: 'varchar', length: 32 })
  attributeId: string;

  @Column({ type: 'text' })
  value: string;
}
