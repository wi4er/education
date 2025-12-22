import { BaseAttributesView, AttributeType } from './common.view';

export interface AttributeView {

  id: string;
  type: AttributeType;
  asPoint?: string;
  status: string[];
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;

}
