import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { User } from './user.entity';
import { Attribute } from '../../../settings/entities/attribute/attribute.entity';
import { File } from '../../../storage/entities/file/file.entity';
import { CommonFileEntity } from '../../../common/entities/common-file.entity';

@Entity('personal_user2file')
export class User2File
  extends BaseEntity
  implements CommonFileEntity<User>
{

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user: User) => user.files, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: User;

  @Column({ type: 'varchar', length: 36 })
  parentId: string;

  @ManyToOne(() => Attribute, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @Column({ type: 'varchar', length: 36 })
  attributeId: string;

  @ManyToOne(() => File, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'fileId' })
  file: File;

  @Column({ type: 'varchar', length: 36 })
  fileId: string;

}
