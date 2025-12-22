import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { User } from './user.entity';
import { Status } from '../../../settings/entities/status/status.entity';

@Entity('personal_user4status')
export class User4Status extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => User,
    (user: User) => user.statuses,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: User;

  @Column({ type: 'varchar', length: 32 })
  parentId: string;

  @ManyToOne(
    () => Status,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @Column({ type: 'varchar', length: 32 })
  statusId: string;

}
