import { CommonStringEntity } from './common-string.entity';

export interface WithStrings<TParent> {
  id: string;
  strings: CommonStringEntity<TParent>[];
}
