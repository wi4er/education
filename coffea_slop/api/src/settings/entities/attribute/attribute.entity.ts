import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  BaseEntity,
} from 'typeorm';
import {Attribute2String} from './attribute2string.entity';
import {Attribute2Point} from './attribute2point.entity';
import {Attribute2AsPoint} from './attributeAsPoint.entity';
import {Attribute4Status} from './attribute4status.entity';
import {WithStrings} from '../../../common/entities/with-strings.entity';
import {WithPoints} from '../../../common/entities/with-points.entity';
import {AttributeType} from './attribute-type.enum';

@Entity('settings_attribute')
export class Attribute
  extends BaseEntity
  implements WithStrings<Attribute>,
    WithPoints<Attribute> {

  @PrimaryColumn({
    type: 'varchar',
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 16,
    default: AttributeType.STRING,
  })
  type: AttributeType;

  @OneToMany(
    () => Attribute2String,
    (attrString: Attribute2String) => attrString.parent,
  )
  strings: Attribute2String[];

  @OneToMany(
    () => Attribute2Point,
    (attrPoint: Attribute2Point) => attrPoint.parent,
  )
  points: Attribute2Point[];

  @OneToOne(
    () => Attribute2AsPoint,
    asPoint => asPoint.parent,
  )
  asPoint: Attribute2AsPoint;

  @OneToMany(
    () => Attribute4Status,
    (status: Attribute4Status) => status.parent,
  )
  statuses: Attribute4Status[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
