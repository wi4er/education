import { AttributesView } from '../../common/views/attributes.view';

export interface UserView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: AttributesView;

}
