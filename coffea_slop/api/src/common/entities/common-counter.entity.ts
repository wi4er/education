import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Point } from '../../registry/entities/point/point.entity';
import { Measure } from '../../registry/entities/measure/measure.entity';

export interface CommonCounterEntity<T> {
  id: number;
  parent: T;
  parentId: string;
  attribute: Attribute;
  attributeId: string;
  point: Point | null;
  pointId: string | null;
  measure: Measure | null;
  measureId: string | null;
  count: number;
}
