import {FullAttributesView} from '../../common/views/attributes.view';
import {WithPermissionsView} from '../../common/views/with-permissions.view';
import {WithStatusesView} from '../../common/views/with-statuses.view';

export interface ElementView
  extends WithPermissionsView, WithStatusesView {

  parentId: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: FullAttributesView;

  images: string[];
  sections: string[];

}
