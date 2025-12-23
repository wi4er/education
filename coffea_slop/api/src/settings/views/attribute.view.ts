import { BaseAttributesView } from '../../common/views/attributes.view';
import { WithStatusesView } from '../../common/views/with-statuses.view';
import { AttributeType } from '../entities/attribute/attribute-type.enum';

export interface AttributeView extends WithStatusesView {
  id: string;
  type: AttributeType;
  asPoint?: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;
}
