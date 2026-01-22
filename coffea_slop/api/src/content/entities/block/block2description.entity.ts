import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import {Block} from './block.entity';
import {Language} from '../../../settings/entities/language/language.entity';
import {Attribute} from '../../../settings/entities/attribute/attribute.entity';
import {CommonDescriptionEntity} from '../../../common/entities/common-description.entity';

@Entity('content_block2description')
export class Block2Description
  extends BaseEntity
  implements CommonDescriptionEntity<Block> {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Block, (block: Block) => block.descriptions, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent: Block;

  @Column({ type: 'varchar', length: 36 })
  parentId: string;

  @ManyToOne(() => Language, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'languageId' })
  language: Language | null;

  @Column({ type: 'varchar', length: 36, nullable: true })
  languageId: string | null;

  @ManyToOne(() => Attribute, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'attributeId' })
  attribute: Attribute;

  @Column({ type: 'varchar', length: 36 })
  attributeId: string;

  @Column({ type: 'text' })
  value: string;

}
