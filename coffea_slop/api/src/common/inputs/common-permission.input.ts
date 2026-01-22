import {PermissionMethod} from '../permission/permission.method';

export interface CommonPermissionInput {

  parentId: string;
  groupId: string;
  method: PermissionMethod;

}
