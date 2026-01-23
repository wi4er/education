import { CommonImageEntity } from './common-image.entity';

export interface WithImages<T> {

  images: CommonImageEntity<T>[];

}
