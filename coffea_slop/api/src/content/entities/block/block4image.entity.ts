import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Block} from './block.entity';
import {File} from '../../../storage/entities/file/file.entity';

@Entity('content_block4image')
export class Block4Image
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Block,
    (block: Block) => block.images,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Block;

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
