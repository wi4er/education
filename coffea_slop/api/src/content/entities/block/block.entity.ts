import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import {Block2String} from './block2string.entity';
import {Block2Point} from './block2point.entity';
import {Block4Permission} from './block4permission.entity';
import {Block4Status} from './block4status.entity';
import {Block2Description} from './block2description.entity';
import {Block2Counter} from './block2counter.entity';
import {Block2File} from './block2file.entity';
import {Block4Image} from './block4image.entity';
import {Element} from '../element/element.entity';
import {Section} from '../section/section.entity';
import {WithStrings} from '../../../common/entities/with-strings.entity';
import {WithPoints} from '../../../common/entities/with-points.entity';
import {WithPermissions} from '../../../common/entities/with-permissions.entity';
import {WithDescriptions} from '../../../common/entities/with-descriptions.entity';
import {WithStatuses} from '../../../common/entities/with-statuses.entity';
import {WithFiles} from '../../../common/entities/with-files.entity';

@Entity('content_block')
export class Block
  extends BaseEntity
  implements WithStrings<Block>,
    WithPoints<Block>,
    WithPermissions<Block>,
    WithDescriptions<Block>,
    WithStatuses<Block>,
    WithFiles<Block> {

  @PrimaryColumn({
    type: 'varchar',
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(
    () => Block2String,
    (blockString: Block2String) => blockString.parent,
  )
  strings: Block2String[];

  @OneToMany(() => Block2Point, (blockPoint: Block2Point) => blockPoint.parent)
  points: Block2Point[];

  @OneToMany(
    () => Block4Permission,
    (blockPermission: Block4Permission) => blockPermission.parent,
  )
  permissions: Block4Permission[];

  @OneToMany(
    () => Block2Description,
    (blockDescription: Block2Description) => blockDescription.parent,
  )
  descriptions: Block2Description[];

  @OneToMany(() => Element, (element: Element) => element.parent)
  elements: Element[];

  @OneToMany(() => Section, (section: Section) => section.parent)
  sections: Section[];

  @OneToMany(
    () => Block2Counter,
    (blockCounter: Block2Counter) => blockCounter.parent,
  )
  counters: Block2Counter[];

  @OneToMany(
    () => Block2File,
    (blockFile: Block2File) => blockFile.parent,
  )
  files: Block2File[];

  @OneToMany(
    () => Block4Image,
    (blockImage: Block4Image) => blockImage.parent,
  )
  images: Block4Image[];

  @OneToMany(
    () => Block4Status,
    (blockStatus: Block4Status) => blockStatus.parent,
  )
  statuses: Block4Status[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
