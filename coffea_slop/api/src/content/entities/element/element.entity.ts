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
import {Element2String} from './element2string.entity';
import {Element2Point} from './element2point.entity';
import {Element4Permission} from './element4permission.entity';
import {Element4Status} from './element4status.entity';
import {Element2Description} from './element2description.entity';
import {Element4Section} from './element4section.entity';
import {Element2Counter} from './element2counter.entity';
import {Element2File} from './element2file.entity';
import {Element4Image} from './element4image.entity';
import {WithStrings} from '../../../common/entities/with-strings.entity';
import {WithPoints} from '../../../common/entities/with-points.entity';
import {WithPermissions} from '../../../common/entities/with-permissions.entity';
import {WithDescriptions} from '../../../common/entities/with-descriptions.entity';
import {WithStatuses} from '../../../common/entities/with-statuses.entity';
import {Block} from '../block/block.entity';

@Entity('content_element')
export class Element
  extends BaseEntity
  implements WithStrings<Element>,
    WithPoints<Element>,
    WithPermissions<Element>,
    WithDescriptions<Element>,
    WithStatuses<Element> {

  @PrimaryColumn({
    type: 'varchar',
    length: 36,
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
    () => Element4Permission,
    (elemPermission: Element4Permission) => elemPermission.parent,
  )
  permissions: Element4Permission[];

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
  @JoinColumn({ name: 'parentId' })
  parent: Block;

  @Column({ type: 'varchar', length: 36, nullable: true })
  parentId: string;

  @OneToMany(
    () => Element4Section,
    (elem4sect: Element4Section) => elem4sect.element,
  )
  sections: Element4Section[];

  @OneToMany(
    () => Element2Counter,
    (elemCounter: Element2Counter) => elemCounter.parent,
  )
  counters: Element2Counter[];

  @OneToMany(
    () => Element2File,
    (elemFile: Element2File) => elemFile.parent,
  )
  files: Element2File[];

  @OneToMany(
    () => Element4Image,
    (elemImage: Element4Image) => elemImage.parent,
  )
  images: Element4Image[];

  @OneToMany(
    () => Element4Status,
    (elemStatus: Element4Status) => elemStatus.parent,
  )
  statuses: Element4Status[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
