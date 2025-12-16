import { BaseAttributesView } from '../../common/views/attributes.view';

export interface MeasureView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;

}
