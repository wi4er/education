import { BaseAttributesView } from '../../common/views/attributes.view';
import { WithStatusesView } from '../../common/views/with-statuses.view';

export interface FileView
  extends WithStatusesView {

  id: string;
  parentId: string;
  path: string;
  original: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;

}
