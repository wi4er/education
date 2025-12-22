import { CommonStringInput } from '../../common/inputs/common-string.input';
import { CommonPointInput } from '../../common/inputs/common-point.input';
import { CommonPermissionInput } from '../../common/inputs/common-permission.input';
import { CommonDescriptionInput } from '../../common/inputs/common-description.input';
import { CommonCounterInput } from '../../common/inputs/common-counter.input';
import { WithStringsInput } from '../../common/inputs/with-strings.input';
import { WithPointsInput } from '../../common/inputs/with-points.input';
import { WithPermissionsInput } from '../../common/inputs/with-permissions.input';
import { WithDescriptionsInput } from '../../common/inputs/with-descriptions.input';
import { WithStatusesInput } from '../../common/inputs/with-statuses.input';

export interface ElementInput
  extends WithStringsInput,
    WithPointsInput,
    WithPermissionsInput,
    WithDescriptionsInput,
    WithStatusesInput {

  id?: string;
  parentId?: string;

  strings?: CommonStringInput[];
  points?: CommonPointInput[];
  permissions?: CommonPermissionInput[];
  descriptions?: CommonDescriptionInput[];
  counters?: CommonCounterInput[];

  sections?: string[];

}
