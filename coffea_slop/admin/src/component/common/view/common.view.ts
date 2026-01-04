export interface Entity2stringView {

  lang: string;
  attr: string;
  value: string;

}

export interface Entity2pointView {

  attr: string;
  pnt: string;

}

export interface Entity2counterView {

  attr: string;
  pnt: string | null;
  msr: string | null;
  count: number;

}

export interface Entity2descriptionView {

  lang: string;
  attr: string;
  value: string;

}

export interface Entity2fileView {

  attr: string;
  file: string;

}

export interface Entity2permissionView {

  group: string;
  method: string;

}

export interface BaseAttributesView {

  strings: Entity2stringView[];
  points: Entity2pointView[];

}

export interface AttributesView extends BaseAttributesView {

  descriptions: Entity2descriptionView[];

}

export interface AttributesWithCountersView extends AttributesView {

  counters: Entity2counterView[];
  files?: Entity2fileView[];

}

export enum AttributeType {

  STRING = 'STRING',
  POINT = 'POINT',
  COUNTER = 'COUNTER',
  DESCRIPTION = 'DESCRIPTION',
  FILE = 'FILE',

}

export enum AccessEntity {

  ATTRIBUTE = 'ATTRIBUTE',
  LANGUAGE = 'LANGUAGE',
  DIRECTORY = 'DIRECTORY',
  MEASURE = 'MEASURE',
  POINT = 'POINT',
  USER = 'USER',
  GROUP = 'GROUP',
  ACCESS = 'ACCESS',
  BLOCK = 'BLOCK',
  ELEMENT = 'ELEMENT',
  SECTION = 'SECTION',
  FORM = 'FORM',
  RESULT = 'RESULT',

}

export enum AccessMethod {

  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',

}
