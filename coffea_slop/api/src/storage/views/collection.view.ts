import { BaseAttributesView } from '../../common/views/attributes.view';
import { WithPermissionsView } from '../../common/views/with-permissions.view';
import { WithStatusesView } from '../../common/views/with-statuses.view';

export interface CollectionView
  extends WithPermissionsView, WithStatusesView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;

}
