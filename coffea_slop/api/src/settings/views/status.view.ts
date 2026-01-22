import { BaseAttributesView } from '../../common/views/attributes.view';
import { WithStatusesView } from '../../common/views/with-statuses.view';

export interface StatusView
  extends WithStatusesView {

  id: string;
  icon: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;

}
