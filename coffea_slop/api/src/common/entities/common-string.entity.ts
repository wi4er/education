import { Attribute } from '../../settings/entities/attribute/attribute.entity';
import { Language } from '../../settings/entities/language/language.entity';

export interface CommonStringEntity<TParent> {
  id: number;

  parent: TParent;
  parentId: string;

  language: Language | null;
  languageId: string | null;

  attribute: Attribute;
  attributeId: string;

  value: string;
}
