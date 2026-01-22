import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {File} from './file.entity';
import {Status} from '../../../settings/entities/status/status.entity';

@Entity('storage_file4status')
export class File4Status
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => File, (file: File) => file.statuses, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: File;

  @Column({ type: 'varchar', length: 36 })
  parentId: string;

  @ManyToOne(() => Status, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @Column({ type: 'varchar', length: 36 })
  statusId: string;

}

