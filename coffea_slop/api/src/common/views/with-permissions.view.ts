import {Entity2permissionView} from './entity2permission.view';

export interface WithPermissionsView {

  id: string;

  permissions: Entity2permissionView[];

}
