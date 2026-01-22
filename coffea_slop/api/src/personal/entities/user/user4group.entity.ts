import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import {User} from './user.entity';
import {Group} from '../group/group.entity';

@Entity('personal_user4group')
export class User4Group
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user: User) => user.groups, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @ManyToOne(() => Group, (group: Group) => group.users, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({ type: 'varchar', length: 36 })
  groupId: string;

}
