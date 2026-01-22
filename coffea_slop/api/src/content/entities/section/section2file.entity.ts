import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Section} from './section.entity';
import {Attribute} from '../../../settings/entities/attribute/attribute.entity';
import {File} from '../../../storage/entities/file/file.entity';
import {CommonFileEntity} from '../../../common/entities/common-file.entity';

@Entity('content_section2file')
export class Section2File
  extends BaseEntity
  implements CommonFileEntity<Section> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Section,
    (section: Section) => section.files,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Section;

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
