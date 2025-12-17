import { Entity2permissionView } from '../../common/views/entity2permission.view';
import { Entity2counterView } from '../../common/views/entity2counter.view';
import { AttributesView } from '../../common/views/attributes.view';

export interface SectionAttributesView extends AttributesView {
  counters: Entity2counterView[];
}

export interface SectionView {

  id: string;
  parentId: string;
  createdAt: Date;
  updatedAt: Date;

  attributes: SectionAttributesView;
  permissions: Entity2permissionView[];

}
