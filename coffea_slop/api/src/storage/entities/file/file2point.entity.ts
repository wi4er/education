import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { File } from './file.entity';
import { Attribute } from '../../../settings/entities/attribute/attribute.entity';
import { Point } from '../../../registry/entities/point/point.entity';
import { CommonPointEntity } from '../../../common/entities/common-point.entity';

@Entity('storage_file2point')
export class File2Point
  extends BaseEntity
  implements CommonPointEntity<File>
{

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => File, (file: File) => file.points, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: File;

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

  @ManyToOne(() => Point, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'pointId' })
  point: Point;

  @Column({ type: 'varchar', length: 36 })
  pointId: string;

}
