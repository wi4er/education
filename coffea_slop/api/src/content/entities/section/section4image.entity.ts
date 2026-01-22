import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Section} from './section.entity';
import {File} from '../../../storage/entities/file/file.entity';

@Entity('content_section4image')
export class Section4Image
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Section,
    (section: Section) => section.images,
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
