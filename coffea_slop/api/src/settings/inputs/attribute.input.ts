import { CommonStringInput } from '../../common/inputs/common-string.input';
import { CommonPointInput } from '../../common/inputs/common-point.input';
import { WithStringsInput } from '../../common/inputs/with-strings.input';
import { WithPointsInput } from '../../common/inputs/with-points.input';
import { AttributeType } from '../entities/attribute/attribute-type.enum';

export interface AttributeInput
  extends WithStringsInput, WithPointsInput {

  id?: string;
  type?: AttributeType;
  asPoint?: string;

  strings?: CommonStringInput[];
  points?: CommonPointInput[];

}
