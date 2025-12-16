import { BaseAttributesView } from '../../common/views/attributes.view';

export interface PointView {

  id: string;
  createdAt: Date;
  updatedAt: Date;
  directoryId: string;

  attributes: BaseAttributesView;

}
