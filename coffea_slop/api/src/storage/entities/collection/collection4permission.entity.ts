import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, BaseEntity} from 'typeorm';
import {Collection} from './collection.entity';
import {Group} from '../../../personal/entities/group/group.entity';
import {PermissionMethod} from '../../../common/permission/permission.method';
import {CommonPermissionEntity} from '../../../common/entities/common-permission.entity';

@Entity('storage_collection4permission')
export class Collection4Permission
  extends BaseEntity
  implements CommonPermissionEntity<Collection> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Collection,
    collection => collection.permissions,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Collection;

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

