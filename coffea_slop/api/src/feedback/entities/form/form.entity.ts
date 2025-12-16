import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Form2String } from './form2string.entity';
import { Form2Point } from './form2point.entity';
import { Form2Permission } from './form2permission.entity';
import { Form2Description } from './form2description.entity';
import { Result } from '../result/result.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithPermissions } from '../../../common/entities/with-permissions.entity';
import { WithDescriptions } from '../../../common/entities/with-descriptions.entity';

@Entity('feedback_form')
export class Form
  implements WithStrings<Form>,
    WithPoints<Form>,
    WithPermissions<Form>,
    WithDescriptions<Form> {

  @PrimaryColumn({
    type: 'varchar',
    length: 32,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(
    () => Form2String,
    (formString: Form2String) => formString.parent,
  )
  strings: Form2String[];

  @OneToMany(
    () => Form2Point,
    (formPoint: Form2Point) => formPoint.parent,
  )
  points: Form2Point[];

  @OneToMany(
    () => Form2Permission,
    (formPermission: Form2Permission) => formPermission.parent,
  )
  permissions: Form2Permission[];

  @OneToMany(
    () => Form2Description,
    (formDescription: Form2Description) => formDescription.parent,
  )
  descriptions: Form2Description[];

  @OneToMany(
    () => Result,
    (result: Result) => result.form,
  )
  results: Result[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

}
