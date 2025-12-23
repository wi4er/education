import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../entities/access/access-method.enum';

export interface AccessInput {
  id?: number;

  groupId: string;
  entity: AccessEntity;
  method: AccessMethod;
}
