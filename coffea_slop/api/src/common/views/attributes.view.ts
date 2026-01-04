import { Entity2stringView } from './entity2string.view';
import { Entity2pointView } from './entity2point.view';
import { Entity2descriptionView } from './entity2description.view';
import { Entity2counterView } from './entity2counter.view';
import { Entity2fileView } from './entity2file.view';

export interface BaseAttributesView {
  strings: Entity2stringView[];
  points: Entity2pointView[];
}

export interface AttributesView extends BaseAttributesView {
  descriptions: Entity2descriptionView[];
}

export interface FullAttributesView extends AttributesView {
  counters: Entity2counterView[];
  files?: Entity2fileView[];
}
