import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Element } from './element.entity';
import { Group } from '../../../personal/entities/group/group.entity';
import { PermissionMethod } from '../../../common/permission/permission.method';
import { CommonPermissionEntity } from '../../../common/entities/common-permission.entity';

@Entity('content_element4permission')
export class Element4Permission
  extends BaseEntity
  implements CommonPermissionEntity<Element> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Element,
    (element: Element) => element.permissions,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Element;

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
