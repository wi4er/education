import {CommonStatusEntity} from './common-status.entity';

export interface WithStatuses<T> {

  statuses: CommonStatusEntity<T>[];

}
