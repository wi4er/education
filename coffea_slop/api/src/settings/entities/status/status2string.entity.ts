import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Status } from './status.entity';
import { Language } from '../language/language.entity';
import { Attribute } from '../attribute/attribute.entity';
import { CommonStringEntity } from '../../../common/entities/common-string.entity';

@Entity('settings_status2string')
export class Status2String extends BaseEntity
  implements CommonStringEntity<Status> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Status,
    (status: Status) => status.strings,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Status;

  @Column({ type: 'varchar', length: 32 })
  parentId: string;

  @ManyToOne(
    () => Language,
    {
      nullable: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'languageId' })
  language: Language | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  languageId: string | null;

  @ManyToOne(
    () => Attribute,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @Column({ type: 'varchar', length: 32 })
  attributeId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  value: string;

}
