import { BaseAttributesView } from '../../common/view/common.view';

export interface FileView {

  id: string;
  parentId: string;
  path: string;
  original: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;
  status: string[];

}
