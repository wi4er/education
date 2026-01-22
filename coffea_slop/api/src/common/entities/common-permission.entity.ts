import {Group} from '../../personal/entities/group/group.entity';
import {PermissionMethod} from '../permission/permission.method';

export interface CommonPermissionEntity<TParent> {

  id: number;

  parent: TParent;
  parentId: string;

  group?: Group;
  groupId?: string;

  method: PermissionMethod;

}
