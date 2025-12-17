import { Entity2permissionView } from '../../common/views/entity2permission.view';
import { Entity2counterView } from '../../common/views/entity2counter.view';
import { AttributesView } from '../../common/views/attributes.view';

export interface FormAttributesView extends AttributesView {
  counters: Entity2counterView[];
}

export interface FormView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: FormAttributesView;
  permissions: Entity2permissionView[];

}
