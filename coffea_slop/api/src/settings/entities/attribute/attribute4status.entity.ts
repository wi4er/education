import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Attribute } from './attribute.entity';
import { Status } from '../status/status.entity';

@Entity('settings_attribute4status')
export class Attribute4Status
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Attribute, (attribute: Attribute) => attribute.statuses, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Attribute;

  @Column({ type: 'varchar', length: 36 })
  parentId: string;

  @ManyToOne(() => Status, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'statusId' })
  status: Status;

  @Column({ type: 'varchar', length: 36 })
  statusId: string;

}
