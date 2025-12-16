import { Entity2permissionView } from '../../common/views/entity2permission.view';
import { AttributesView } from '../../common/views/attributes.view';

export interface ElementView {

  id: string;
  blockId: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: AttributesView;
  permissions: Entity2permissionView[];

  sections: string[];

}
