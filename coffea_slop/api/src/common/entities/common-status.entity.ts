import {Status} from '../../settings/entities/status/status.entity';

export interface CommonStatusEntity<TParent> {

  id: number;

  parent: TParent;
  parentId: string;

  status: Status;
  statusId: string;

}
