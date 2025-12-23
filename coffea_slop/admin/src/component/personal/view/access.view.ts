import { AccessEntity, AccessMethod } from '../../common/view';

export interface AccessView {

  id: number;

  group: string;
  entity: AccessEntity;
  method: AccessMethod;

}
