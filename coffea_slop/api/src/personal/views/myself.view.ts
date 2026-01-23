import { FullAttributesView } from '../../common/views/attributes.view';
import { WithStatusesView } from '../../common/views/with-statuses.view';
import { WithImagesView } from '../../common/views/with-images.view';

export interface MyselfView
  extends WithStatusesView,
    WithImagesView {

  id: string;
  login?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: FullAttributesView;

}
