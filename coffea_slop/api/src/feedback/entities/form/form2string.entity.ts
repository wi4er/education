import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Form} from './form.entity';
import {Language} from '../../../settings/entities/language/language.entity';
import {Attribute} from '../../../settings/entities/attribute/attribute.entity';
import {CommonStringEntity} from '../../../common/entities/common-string.entity';

@Entity('feedback_form2string')
export class Form2String
  extends BaseEntity
  implements CommonStringEntity<Form> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Form, (form) => form.strings, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Form;

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
