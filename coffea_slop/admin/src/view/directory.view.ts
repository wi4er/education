import { BaseAttributesView, Entity2permissionView } from './common.view';

export interface DirectoryView {

  id: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: BaseAttributesView;
  permissions: Entity2permissionView[];
  status: string[];

}
