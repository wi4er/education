import {File} from '../../storage/entities/file/file.entity';

export interface CommonImageEntity<TParent> {

  id: number;

  parent: TParent;
  parentId: string;

  file: File;
  fileId: string;

}
