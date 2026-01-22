import {CommonPermissionEntity} from './common-permission.entity';

export interface WithPermissions<T> {

  id: string;

  permissions: CommonPermissionEntity<T>[];

}
