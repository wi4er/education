import { UserAttributesView } from './user.view';

export interface MyselfView {

  id: string;
  login?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: UserAttributesView;

}
