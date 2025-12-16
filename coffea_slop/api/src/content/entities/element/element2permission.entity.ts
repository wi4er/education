import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Element } from './element.entity';
import { Group } from '../../../personal/entities/group/group.entity';
import { PermissionMethod } from '../../../common/permission/permission.method';
import { CommonPermissionEntity } from '../../../common/entities/common-permission.entity';

@Entity('content_element2permission')
export class Element2Permission
  implements CommonPermissionEntity<Element> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Element,
    (element) => element.permissions,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Element;

  @Column({ type: 'varchar', length: 32 })
  parentId: string;

  @ManyToOne(
    () => Group,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({ type: 'varchar', length: 32 })
  groupId: string;

  @Column({ type: 'varchar', length: 32 })
  method: PermissionMethod;

}
