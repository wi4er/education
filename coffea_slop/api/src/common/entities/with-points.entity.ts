import {CommonPointEntity} from './common-point.entity';

export interface WithPoints<TParent> {

  id: string;
  points: CommonPointEntity<TParent>[];

}
