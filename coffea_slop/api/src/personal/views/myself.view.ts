import { FullAttributesView } from '../../common/views/attributes.view';

export interface MyselfView {

  id: string;
  login?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: FullAttributesView;

}
