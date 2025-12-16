import { BaseAttributesView } from '../../common/views/attributes.view';

export interface AttributeView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;

}
