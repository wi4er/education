import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import {File2String} from './file2string.entity';
import {File2Point} from './file2point.entity';
import {File4Status} from './file4status.entity';
import {Collection} from '../collection/collection.entity';
import {WithStrings} from '../../../common/entities/with-strings.entity';
import {WithPoints} from '../../../common/entities/with-points.entity';
import {WithStatuses} from '../../../common/entities/with-statuses.entity';


@Entity('storage_file')
export class File
  extends BaseEntity
  implements WithStrings<File>,
    WithPoints<File>,
    WithStatuses<File> {

  @PrimaryColumn({
    type: 'varchar',
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @ManyToOne(() => Collection, parent => parent.files, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Collection;

  @Column({ type: 'varchar', length: 36 })
  parentId: string;

  @Column({ type: 'varchar', length: 512 })
  path: string;

  @Column({ type: 'varchar', length: 255 })
  original: string;

  @OneToMany(
    () => File2String,
    (fileString: File2String) => fileString.parent,
  )
  strings: File2String[];

  @OneToMany(
    () => File2Point,
    (filePoint: File2Point) => filePoint.parent,
  )
  points: File2Point[];

  @OneToMany(
    () => File4Status,
    (fileStatus: File4Status) => fileStatus.parent,
  )
  statuses: File4Status[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
