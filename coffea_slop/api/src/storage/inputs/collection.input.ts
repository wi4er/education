import { CommonStringInput } from '../../common/inputs/common-string.input';
import { CommonPointInput } from '../../common/inputs/common-point.input';
import { CommonPermissionInput } from '../../common/inputs/common-permission.input';
import { WithStringsInput } from '../../common/inputs/with-strings.input';
import { WithPointsInput } from '../../common/inputs/with-points.input';
import { WithPermissionsInput } from '../../common/inputs/with-permissions.input';
import { WithStatusesInput } from '../../common/inputs/with-statuses.input';

export interface CollectionInput
  extends
    WithStringsInput,
    WithPointsInput,
    WithPermissionsInput,
    WithStatusesInput {

  id?: string;

  strings?: CommonStringInput[];
  points?: CommonPointInput[];
  permissions?: CommonPermissionInput[];

}
