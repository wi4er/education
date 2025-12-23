import { AttributesView } from '../../common/views/attributes.view';
import { WithStatusesView } from '../../common/views/with-statuses.view';

export interface GroupView extends WithStatusesView {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: AttributesView;
}
