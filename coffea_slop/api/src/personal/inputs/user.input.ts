import { CommonStringInput } from '../../common/inputs/common-string.input';
import { CommonPointInput } from '../../common/inputs/common-point.input';
import { CommonDescriptionInput } from '../../common/inputs/common-description.input';
import { WithStringsInput } from '../../common/inputs/with-strings.input';
import { WithPointsInput } from '../../common/inputs/with-points.input';
import { WithDescriptionsInput } from '../../common/inputs/with-descriptions.input';

export interface UserInput
  extends WithStringsInput, WithPointsInput, WithDescriptionsInput {

  id?: string;

  strings?: CommonStringInput[];
  points?: CommonPointInput[];
  descriptions?: CommonDescriptionInput[];

}
