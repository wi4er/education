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
import { Element2String } from './element2string.entity';
import { Element2Point } from './element2point.entity';
import { Element2Permission } from './element2permission.entity';
import { Element2Description } from './element2description.entity';
import { Element4Section } from './element4section.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithPermissions } from '../../../common/entities/with-permissions.entity';
import { WithDescriptions } from '../../../common/entities/with-descriptions.entity';
import { Block } from '../block/block.entity';

@Entity('content_element')
export class Element
  implements WithStrings<Element>,
    WithPoints<Element>,
    WithPermissions<Element>,
    WithDescriptions<Element> {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(
    () => Element2String,
    (elemString: Element2String) => elemString.parent,
  )
  strings: Element2String[];

  @OneToMany(
    () => Element2Point,
    (elemPoint: Element2Point) => elemPoint.parent,
  )
  points: Element2Point[];

  @OneToMany(
    () => Element2Permission,
    (elemPermission: Element2Permission) => elemPermission.parent,
  )
  permissions: Element2Permission[];

  @OneToMany(
    () => Element2Description,
    (elemDescription: Element2Description) => elemDescription.parent,
  )
  descriptions: Element2Description[];

  @ManyToOne(
    () => Block,
    (block: Block) => block.elements,
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

  @OneToMany(
    () => Element4Section,
    (elem4sect: Element4Section) => elem4sect.element,
  )
  sections: Element4Section[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
