import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  BaseEntity,
} from 'typeorm';
import { Element } from './element.entity';
import { Section } from '../section/section.entity';

@Entity('content_element4section')
export class Element4Section
  extends BaseEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(
    () => Element,
    (element: Element) => element.sections,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'elementId' })
  element: Element;

  @Column({ type: 'varchar', length: 36 })
  elementId: string;

  @ManyToOne(
    () => Section,
    (section: Section) => section.elements,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'sectionId' })
  section: Section;

  @Column({ type: 'varchar', length: 36 })
  sectionId: string;

}
