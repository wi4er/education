import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Block} from './block.entity';
import {Group} from '../../../personal/entities/group/group.entity';
import {PermissionMethod} from '../../../common/permission/permission.method';
import {CommonPermissionEntity} from '../../../common/entities/common-permission.entity';

@Entity('content_block4permission')
export class Block4Permission
  extends BaseEntity
  implements CommonPermissionEntity<Block> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Block,
    block => block.permissions,
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
    () => Group,
    {
      nullable: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'groupId' })
  group?: Group;

  @Column({ type: 'varchar', length: 36, nullable: true })
  groupId?: string;

  @Column({ type: 'varchar', length: 36 })
  method: PermissionMethod;

}
