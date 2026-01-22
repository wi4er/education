import { AccessEntity } from '../../common/access/access-entity.enum';
import { AccessMethod } from '../entities/access/access-method.enum';

export interface AccessView {

  id: number;

  group: string;
  entity: AccessEntity;
  method: AccessMethod;

}
