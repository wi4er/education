import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {Form} from './form.entity';
import {Group} from '../../../personal/entities/group/group.entity';
import {PermissionMethod} from '../../../common/permission/permission.method';
import {CommonPermissionEntity} from '../../../common/entities/common-permission.entity';

@Entity('feedback_form4permission')
export class Form4Permission
  extends BaseEntity
  implements CommonPermissionEntity<Form> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Form, (form) => form.permissions, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Form;

  @Column({ type: 'varchar', length: 36 })
  parentId: string;

  @ManyToOne(() => Group, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'groupId' })
  group?: Group;

  @Column({ type: 'varchar', length: 36, nullable: true })
  groupId?: string;

  @Column({ type: 'varchar', length: 36 })
  method: PermissionMethod;

}
