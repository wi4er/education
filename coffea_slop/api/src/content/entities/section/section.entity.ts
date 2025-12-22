import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Column,
  BaseEntity,
} from 'typeorm';
import { Section2String } from './section2string.entity';
import { Section2Point } from './section2point.entity';
import { Section4Permission } from './section4permission.entity';
import { Section4Status } from './section4status.entity';
import { Section2Description } from './section2description.entity';
import { Section2Counter } from './section2counter.entity';
import { Element4Section } from '../element/element4section.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithPermissions } from '../../../common/entities/with-permissions.entity';
import { WithDescriptions } from '../../../common/entities/with-descriptions.entity';
import { WithStatuses } from '../../../common/entities/with-statuses.entity';
import { Block } from '../block/block.entity';

@Entity('content_section')
export class Section
  extends BaseEntity
  implements WithStrings<Section>,
    WithPoints<Section>,
    WithPermissions<Section>,
    WithDescriptions<Section>,
    WithStatuses<Section> {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(
    () => Section2String,
    (sectString: Section2String) => sectString.parent,
  )
  strings: Section2String[];

  @OneToMany(
    () => Section2Point,
    (sectPoint: Section2Point) => sectPoint.parent,
  )
  points: Section2Point[];

  @OneToMany(
    () => Section4Permission,
    (sectPermission: Section4Permission) => sectPermission.parent,
  )
  permissions: Section4Permission[];

  @OneToMany(
    () => Section2Description,
    (sectDescription: Section2Description) => sectDescription.parent,
  )
  descriptions: Section2Description[];

  @OneToMany(
    () => Element4Section,
    (elem4sect: Element4Section) => elem4sect.section,
  )
  elements: Element4Section[];

  @OneToMany(
    () => Section2Counter,
    (sectCounter: Section2Counter) => sectCounter.parent,
  )
  counters: Section2Counter[];

  @ManyToOne(
    () => Block,
    (block: Block) => block.sections,
    {
      nullable: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentId' })
  parent: Block;

  @Column({ type: 'varchar', length: 32, nullable: true })
  parentId: string;

  @OneToMany(
    () => Section4Status,
    (sectStatus: Section4Status) => sectStatus.parent,
  )
  statuses: Section4Status[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
