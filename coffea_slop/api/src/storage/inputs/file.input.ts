import {CommonStringInput} from '../../common/inputs/common-string.input';
import {CommonPointInput} from '../../common/inputs/common-point.input';
import {WithStringsInput} from '../../common/inputs/with-strings.input';
import {WithPointsInput} from '../../common/inputs/with-points.input';
import {WithStatusesInput} from '../../common/inputs/with-statuses.input';

export interface FileInput
  extends
    WithStringsInput,
    WithPointsInput,
    WithStatusesInput {

  id?: string;
  parentId: string;
  path: string;
  original: string;

  strings?: CommonStringInput[];
  points?: CommonPointInput[];

}
