import { CommonStringInput } from '../../common/inputs/common-string.input';
import { CommonPointInput } from '../../common/inputs/common-point.input';
import { CommonPermissionInput } from '../../common/inputs/common-permission.input';
import { CommonDescriptionInput } from '../../common/inputs/common-description.input';
import { WithStringsInput } from '../../common/inputs/with-strings.input';
import { WithPointsInput } from '../../common/inputs/with-points.input';
import { WithPermissionsInput } from '../../common/inputs/with-permissions.input';
import { WithDescriptionsInput } from '../../common/inputs/with-descriptions.input';

export interface ElementInput
  extends WithStringsInput, WithPointsInput, WithPermissionsInput, WithDescriptionsInput {

  id?: string;
  blockId?: string;

  strings?: CommonStringInput[];
  points?: CommonPointInput[];
  permissions?: CommonPermissionInput[];
  descriptions?: CommonDescriptionInput[];

  sections?: string[];

}
