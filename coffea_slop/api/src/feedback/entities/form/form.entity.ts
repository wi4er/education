import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm';
import { Form2String } from './form2string.entity';
import { Form2Point } from './form2point.entity';
import { Form4Permission } from './form4permission.entity';
import { Form4Status } from './form4status.entity';
import { Form2Description } from './form2description.entity';
import { Form2Counter } from './form2counter.entity';
import { Form2File } from './form2file.entity';
import { Result } from '../result/result.entity';
import { WithStrings } from '../../../common/entities/with-strings.entity';
import { WithPoints } from '../../../common/entities/with-points.entity';
import { WithPermissions } from '../../../common/entities/with-permissions.entity';
import { WithDescriptions } from '../../../common/entities/with-descriptions.entity';
import { WithStatuses } from '../../../common/entities/with-statuses.entity';
import { WithFiles } from '../../../common/entities/with-files.entity';

@Entity('feedback_form')
export class Form
  extends BaseEntity
  implements
    WithStrings<Form>,
    WithPoints<Form>,
    WithPermissions<Form>,
    WithDescriptions<Form>,
    WithStatuses<Form>,
    WithFiles<Form>
{
  @PrimaryColumn({
    type: 'varchar',
    length: 36,
    default: () => 'uuid_generate_v4()',
  })
  id: string;

  @OneToMany(() => Form2String, (formString: Form2String) => formString.parent)
  strings: Form2String[];

  @OneToMany(() => Form2Point, (formPoint: Form2Point) => formPoint.parent)
  points: Form2Point[];

  @OneToMany(
    () => Form4Permission,
    (formPermission: Form4Permission) => formPermission.parent,
  )
  permissions: Form4Permission[];

  @OneToMany(
    () => Form2Description,
    (formDescription: Form2Description) => formDescription.parent,
  )
  descriptions: Form2Description[];

  @OneToMany(() => Result, (result: Result) => result.form)
  results: Result[];

  @OneToMany(
    () => Form2Counter,
    (formCounter: Form2Counter) => formCounter.parent,
  )
  counters: Form2Counter[];

  @OneToMany(
    () => Form2File,
    (formFile: Form2File) => formFile.parent,
  )
  files: Form2File[];

  @OneToMany(() => Form4Status, (formStatus: Form4Status) => formStatus.parent)
  statuses: Form4Status[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
