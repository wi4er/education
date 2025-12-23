import { CommonDescriptionEntity } from './common-description.entity';

export interface WithDescriptions<T> {
  id: string;

  descriptions: CommonDescriptionEntity<T>[];
}
