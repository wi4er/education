import { Entity2stringView } from './entity2string.view';

export interface WithStringsView {
  id: string;

  strings: Entity2stringView[];
}
