import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Block2String } from './block2string.entity';
import { Block2Point } from './block2point.entity';
import { Block2Permission } from './block2permission.entity';
import { Block2Description } from './block2description.entity';
import { Element } from '../element/element.entity';
import { Section } from '../section/section.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithPermissions } from '../../../common/entities/with-permissions.entity';
import { WithDescriptions } from '../../../common/entities/with-descriptions.entity';

@Entity('content_block')
export class Block
  implements WithStrings<Block>,
    WithPoints<Block>,
    WithPermissions<Block>,
    WithDescriptions<Block> {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(
    () => Block2String,
    (blockString: Block2String) => blockString.parent,
  )
  strings: Block2String[];

  @OneToMany(
    () => Block2Point,
    (blockPoint: Block2Point) => blockPoint.parent,
  )
  points: Block2Point[];

  @OneToMany(
    () => Block2Permission,
    (blockPermission: Block2Permission) => blockPermission.parent,
  )
  permissions: Block2Permission[];

  @OneToMany(
    () => Block2Description,
    (blockDescription: Block2Description) => blockDescription.parent,
  )
  descriptions: Block2Description[];

  @OneToMany(
    () => Element,
    (element: Element) => element.block,
  )
  elements: Element[];

  @OneToMany(
    () => Section,
    (section: Section) => section.block,
  )
  sections: Section[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
