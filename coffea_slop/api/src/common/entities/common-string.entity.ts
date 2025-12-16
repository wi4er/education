import { Attribute } from '../../settings/entities/attribute/attribute.entity';

export interface CommonStringEntity<TParent> {

  id: number;

  parent: TParent;
  parentId: string;

  attribute: Attribute;
  attributeId: string;

  value: string;

}
