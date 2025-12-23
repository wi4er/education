import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Group } from '../group/group.entity';
import { AccessEntity } from '../../../common/access/access-entity.enum';
import { AccessMethod } from './access-method.enum';

@Entity('personal_access')
export class Access extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({ type: 'varchar', length: 32 })
  groupId: string;

  @Column({ type: 'varchar', length: 32 })
  entity: AccessEntity;

  @Column({ type: 'varchar', length: 32 })
  method: AccessMethod;
}
