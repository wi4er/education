import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { File } from './file.entity';
import { Language } from '../../../settings/entities/language/language.entity';
import { Attribute } from '../../../settings/entities/attribute/attribute.entity';
import { CommonStringEntity } from '../../../common/entities/common-string.entity';

@Entity('storage_file2string')
export class File2String
  extends BaseEntity
  implements CommonStringEntity<File>
{

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => File, file => file.strings, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: File;

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
