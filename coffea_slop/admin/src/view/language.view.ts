import { BaseAttributesView } from './common.view';

export interface LanguageView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;
  status: string[];

}
