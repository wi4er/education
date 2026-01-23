import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Attribute } from './attribute.entity';
import { Directory } from '../../../registry/entities/directory/directory.entity';

@Entity('settings_attributeAsPoint')
export class Attribute2AsPoint
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Attribute,
    attribute => attribute.asPoint,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Attribute;

  @Column({ type: 'varchar', length: 36 })
  parentId: string;

  @ManyToOne(
    () => Directory,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'directoryId' })
  directory: Directory;

  @Column({ type: 'varchar', length: 36 })
  directoryId: string;

}
