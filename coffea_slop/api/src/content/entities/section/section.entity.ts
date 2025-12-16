import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Section2String } from './section2string.entity';
import { Section2Point } from './section2point.entity';
import { Section2Permission } from './section2permission.entity';
import { Section2Description } from './section2description.entity';
import { Element4Section } from '../element/element4section.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithPermissions } from '../../../common/entities/with-permissions.entity';
import { WithDescriptions } from '../../../common/entities/with-descriptions.entity';
import { Block } from '../block/block.entity';

@Entity('content_section')
export class Section
  implements WithStrings<Section>,
    WithPoints<Section>,
    WithPermissions<Section>,
    WithDescriptions<Section> {

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
    () => Section2Permission,
    (sectPermission: Section2Permission) => sectPermission.parent,
  )
  permissions: Section2Permission[];

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

  @ManyToOne(
    () => Block,
    (block: Block) => block.sections,
    {
      nullable: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'blockId' })
  block: Block;

  @Column({ type: 'varchar', length: 32, nullable: true })
  blockId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
