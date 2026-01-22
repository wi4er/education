import {FullAttributesView} from '../../common/views/attributes.view';
import {WithStatusesView} from '../../common/views/with-statuses.view';

export interface UserView
  extends WithStatusesView {

  id: string;
  login?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: FullAttributesView;
  images: string[];

}
