import { FullAttributesView } from '../../common/views/attributes.view';
import { WithPermissionsView } from '../../common/views/with-permissions.view';
import { WithStatusesView } from '../../common/views/with-statuses.view';

export interface BlockView extends WithPermissionsView, WithStatusesView {

  createdAt: Date;
  updatedAt: Date;

  attributes: FullAttributesView;

}

