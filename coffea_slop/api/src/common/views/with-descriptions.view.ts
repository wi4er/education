import { Entity2descriptionView } from './entity2description.view';

export interface WithDescriptionsView {
  id: string;

  descriptions: Entity2descriptionView[];
}
