import { Entity2permissionView } from '../../common/views/entity2permission.view';
import { BaseAttributesView } from '../../common/views/attributes.view';

export interface DirectoryView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;
  permissions: Entity2permissionView[];

}
