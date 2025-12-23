import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Directory } from './directory.entity';
import { Status } from '../../../settings/entities/status/status.entity';

@Entity('registry_directory4status')
export class Directory4Status extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Directory, (directory: Directory) => directory.statuses, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Directory;

  @Column({ type: 'varchar', length: 32 })
  parentId: string;

  @ManyToOne(() => Status, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @Column({ type: 'varchar', length: 32 })
  statusId: string;
}
