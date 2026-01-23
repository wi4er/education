import { CommonStringInput } from '../../common/inputs/common-string.input';
import { CommonPointInput } from '../../common/inputs/common-point.input';
import { CommonDescriptionInput } from '../../common/inputs/common-description.input';
import { CommonCounterInput } from '../../common/inputs/common-counter.input';
import { WithStringsInput } from '../../common/inputs/with-strings.input';
import { WithPointsInput } from '../../common/inputs/with-points.input';
import { WithDescriptionsInput } from '../../common/inputs/with-descriptions.input';
import { CommonFileInput } from '../../common/inputs/common-file.input';
import { WithStatusesInput } from '../../common/inputs/with-statuses.input';

export interface MyselfInput
  extends WithStringsInput,
    WithPointsInput,
    WithDescriptionsInput,
    WithStatusesInput {

  id?: string;
  login?: string;
  password?: string;
  email?: string;
  phone?: string;

  strings?: CommonStringInput[];
  points?: CommonPointInput[];
  descriptions?: CommonDescriptionInput[];
  counters?: CommonCounterInput[];
  files?: CommonFileInput[];
  images?: string[];

}
