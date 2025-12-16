import { BaseAttributesView } from '../../common/views/attributes.view';

export interface LanguageView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;

}
