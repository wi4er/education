import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Section } from './section.entity';
import { Group } from '../../../personal/entities/group/group.entity';
import { PermissionMethod } from '../../../common/permission/permission.method';
import { CommonPermissionEntity } from '../../../common/entities/common-permission.entity';

@Entity('content_section4permission')
export class Section4Permission
  extends BaseEntity
  implements CommonPermissionEntity<Section> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Section,
    section => section.permissions,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Section;

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
