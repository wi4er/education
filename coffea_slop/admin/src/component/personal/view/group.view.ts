import { AttributesView } from '../../common/view';

export interface GroupView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: AttributesView;
  status: string[];

}
