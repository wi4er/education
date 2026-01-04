export interface CommonFileEntity<T> {

  id: number;

  parent: T;
  parentId: string;

  attributeId: string;
  fileId: string;

}
