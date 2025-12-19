import { BaseAttributesView } from '../../common/views/attributes.view';
import { AttributeType } from '../entities/attribute/attribute-type.enum';

export interface AttributeView {

  id: string;
  type: AttributeType;
  asPoint?: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;

}
