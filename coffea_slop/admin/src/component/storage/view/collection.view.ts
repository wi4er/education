import { BaseAttributesView, Entity2permissionView } from '../../common/view/common.view';

export interface CollectionView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;
  permissions: Entity2permissionView[];
  status: string[];

}
