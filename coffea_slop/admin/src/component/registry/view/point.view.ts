import { BaseAttributesView } from '../../common/view';

export interface PointView {

  id: string;
  createdAt: Date;
  updatedAt: Date;
  directoryId: string;

  attributes: BaseAttributesView;
  status: string[];

}
