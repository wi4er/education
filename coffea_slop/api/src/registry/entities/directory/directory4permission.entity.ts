import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Directory } from './directory.entity';
import { Group } from '../../../personal/entities/group/group.entity';
import { PermissionMethod } from '../../../common/permission/permission.method';
import { CommonPermissionEntity } from '../../../common/entities/common-permission.entity';

@Entity('registry_directory4permission')
export class Directory4Permission
  extends BaseEntity
  implements CommonPermissionEntity<Directory> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Directory,
    directory => directory.permissions,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Directory;

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
