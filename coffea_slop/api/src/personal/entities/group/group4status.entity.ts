import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Group} from './group.entity';
import {Status} from '../../../settings/entities/status/status.entity';

@Entity('personal_group4status')
export class Group4Status
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, (group: Group) => group.statuses, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Group;

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
