import { FullAttributesView } from '../../common/views/attributes.view';
import { WithImagesView } from '../../common/views/with-images.view';
import { WithPermissionsView } from '../../common/views/with-permissions.view';
import { WithStatusesView } from '../../common/views/with-statuses.view';

export interface SectionView
  extends WithPermissionsView,
    WithStatusesView,
    WithImagesView {

  parentId: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: FullAttributesView;

}
