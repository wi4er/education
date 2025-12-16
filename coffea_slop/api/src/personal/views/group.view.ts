import { AttributesView } from '../../common/views/attributes.view';

export interface GroupView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: AttributesView;

}
