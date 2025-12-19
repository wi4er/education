import { BaseAttributesView } from './attributes.view';

export enum AttributeType {
  STRING = 'STRING',
  POINT = 'POINT',
  COUNTER = 'COUNTER',
  DESCRIPTION = 'DESCRIPTION',
}

export interface AttributeView {

  id: string;
  type: AttributeType;
  createdAt: Date;
  updatedAt: Date;
  asPoint: string;

  attributes: BaseAttributesView;

}
