import { CommonFileEntity } from './common-file.entity';

export interface WithFiles<TParent> {
  id: string;
  files: CommonFileEntity<TParent>[];
}
