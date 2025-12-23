import { BaseAttributesView } from '../../common/view';

export interface StatusView {

  id: string;
  icon: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;
  status: string[];

}
