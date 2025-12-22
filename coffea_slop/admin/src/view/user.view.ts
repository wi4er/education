import { AttributesWithCountersView } from './common.view';

export interface UserView {

  id: string;
  login?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: AttributesWithCountersView;
  status: string[];

}

export interface MyselfView {

  id: string;
  login?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: AttributesWithCountersView;

}

export interface SignInView {

  id: string;
  login: string;

}
