import { BaseAttributesView } from './common.view';

export interface MeasureView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;
  status: string[];

}
