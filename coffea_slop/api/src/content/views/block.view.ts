import { Entity2permissionView } from '../../common/views/entity2permission.view';
import { AttributesView } from '../../common/views/attributes.view';

export interface BlockView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: AttributesView;
  permissions: Entity2permissionView[];

}

