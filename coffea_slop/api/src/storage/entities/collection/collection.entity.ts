import {Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, OneToMany, BaseEntity, Check} from 'typeorm';
import {Collection2String} from './collection2string.entity';
import {Collection2Point} from './collection2point.entity';
import {Collection4Status} from './collection4status.entity';
import {Collection4Permission} from './collection4permission.entity';
import {File} from '../file/file.entity';
import {WithStrings} from '../../../common/entities/with-strings.entity';
import {WithPoints} from '../../../common/entities/with-points.entity';
import {WithStatuses} from '../../../common/entities/with-statuses.entity';
import {WithPermissions} from '../../../common/entities/with-permissions.entity';

@Entity('storage_collection')
@Check('"id" <> \'\'')
export class Collection
  extends BaseEntity
  implements
    WithStrings<Collection>,
    WithPoints<Collection>,
    WithPermissions<Collection>,
    WithStatuses<Collection>
{

  @PrimaryColumn({
    type: 'varchar',
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(
    () => Collection2String,
    (collectionString: Collection2String) => collectionString.parent,
  )
  strings: Collection2String[];

  @OneToMany(
    () => Collection2Point,
    (collectionPoint: Collection2Point) => collectionPoint.parent,
  )
  points: Collection2Point[];

  @OneToMany(
    () => Collection4Permission,
    (collectionPermission: Collection4Permission) => collectionPermission.parent,
  )
  permissions: Collection4Permission[];

  @OneToMany(
    () => Collection4Status,
    (collectionStatus: Collection4Status) => collectionStatus.parent,
  )
  statuses: Collection4Status[];

  @OneToMany(
    () => File,
    (file: File) => file.parent,
  )
  files: File[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
