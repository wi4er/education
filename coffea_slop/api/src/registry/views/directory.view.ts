import { BaseAttributesView } from '../../common/views/attributes.view';
import { WithPermissionsView } from '../../common/views/with-permissions.view';
import { WithStatusesView } from '../../common/views/with-statuses.view';

export interface DirectoryView extends WithPermissionsView, WithStatusesView {
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;
}
