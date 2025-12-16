import { CommonStringInput } from '../../common/inputs/common-string.input';
import { CommonPointInput } from '../../common/inputs/common-point.input';
import { WithStringsInput } from '../../common/inputs/with-strings.input';
import { WithPointsInput } from '../../common/inputs/with-points.input';

export interface PointInput
  extends WithStringsInput, WithPointsInput {

  id?: string;
  directoryId: string;

  strings?: CommonStringInput[];
  points?: CommonPointInput[];

}
