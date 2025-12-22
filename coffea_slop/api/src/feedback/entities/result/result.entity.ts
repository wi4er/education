import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  BaseEntity,
} from 'typeorm';
import { Form } from '../form/form.entity';

@Entity('feedback_result')
export class Result
  extends BaseEntity {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @ManyToOne(
    () => Form,
    (form: Form) => form.results,
    {
      nullable: false,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'formId' })
  form: Form;

  @Column({ type: 'varchar', length: 32 })
  formId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
