import { AttributesWithCountersView, Entity2permissionView } from './common.view';

export interface ElementView {

  id: string;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: AttributesWithCountersView;
  permissions: Entity2permissionView[];
  status: string[];

  sections: string[];

}
