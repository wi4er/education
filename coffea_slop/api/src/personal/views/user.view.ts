import { AttributesView } from '../../common/views/attributes.view';
import { Entity2counterView } from '../../common/views/entity2counter.view';

export interface UserAttributesView extends AttributesView {
  counters: Entity2counterView[];
}

export interface UserView {

  id: string;
  login?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: UserAttributesView;

}
