import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Section } from './section.entity';
import { Group } from '../../../personal/entities/group/group.entity';
import { PermissionMethod } from '../../../common/permission/permission.method';
import { CommonPermissionEntity } from '../../../common/entities/common-permission.entity';

@Entity('content_section2permission')
export class Section2Permission
  implements CommonPermissionEntity<Section> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Section,
    (section) => section.permissions,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Section;

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
