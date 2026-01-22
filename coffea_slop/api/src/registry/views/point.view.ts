import {BaseAttributesView} from '../../common/views/attributes.view';
import {WithStatusesView} from '../../common/views/with-statuses.view';

export interface PointView
  extends WithStatusesView {

  id: string;
  createdAt: Date;
  updatedAt: Date;
  directoryId: string;

  attributes: BaseAttributesView;

}
