import { CommonStringInput } from '../../common/inputs/common-string.input';
import { CommonPointInput } from '../../common/inputs/common-point.input';
import { WithStringsInput } from '../../common/inputs/with-strings.input';
import { WithPointsInput } from '../../common/inputs/with-points.input';
import { WithStatusesInput } from '../../common/inputs/with-statuses.input';

export interface StatusInput
  extends WithStringsInput, WithPointsInput, WithStatusesInput {
  id?: string;
  icon?: string | null;
  color?: string | null;

  strings?: CommonStringInput[];
  points?: CommonPointInput[];
}
