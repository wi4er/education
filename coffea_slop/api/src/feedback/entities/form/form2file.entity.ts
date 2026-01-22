import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Form} from './form.entity';
import {Attribute} from '../../../settings/entities/attribute/attribute.entity';
import {File} from '../../../storage/entities/file/file.entity';
import {CommonFileEntity} from '../../../common/entities/common-file.entity';

@Entity('feedback_form2file')
export class Form2File
  extends BaseEntity
  implements CommonFileEntity<Form> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Form,
    form => form.files,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Form;

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
    () => File,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'fileId' })
  file: File;

  @Column({ type: 'varchar', length: 36 })
  fileId: string;

}
