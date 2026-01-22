import { Point } from '../../registry/entities/point/point.entity';
import { Attribute } from '../../settings/entities/attribute/attribute.entity';

export interface CommonPointEntity<TParent> {

  id: number;

  parent: TParent;
  parentId: string;

  attribute: Attribute;
  attributeId: string;

  point: Point;
  pointId: string;

}
