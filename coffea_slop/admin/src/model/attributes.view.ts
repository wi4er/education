import { Entity2stringView } from './entity2string.view';
import { Entity2pointView } from './entity2point.view';

export interface BaseAttributesView {

  strings: Entity2stringView[];
  points: Entity2pointView[];

}
