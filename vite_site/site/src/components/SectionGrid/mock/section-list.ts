import type { SectionItem } from '../SectionItem.ts';
import FirstPng from './1.png';
import SectionPng from './2.png';
import FourthPng from './4.png';
import SixthPng from './6.png';
import EightPng from './8.png';
import TenthPng from './10.png';
import FourteenhtPng from './14.png';

export const sectionList: Array<SectionItem> = [{
  id: 1,
  img: FirstPng,
  color: '#D9D0CB',
}, {
  id: 2,
  img: SectionPng,
  color: '#252525',
}, {
  id: 3,
  img: null,
  color: '#000000',
}, {
  id: 4,
  img: FourthPng,
  color: '#1B234B',
}, {
  id: 5,
  img: null,
  color: '#F1F1F1',
  text: 'Clothing',
}, {
  id: 6,
  img: SixthPng,
  color: '#181312',
}, {
  id: 7,
  img: null,
  color: '#F8EDDE',
  text: 'Zines',
}, {
  id: 8,
  img: EightPng,
  color: '#4F1212',
}, {
  id: 9,
  img: null,
  color: '#969F7D',
  text: 'Live Music',
}, {
  id: 10,
  img: TenthPng,
  color: '#00326E',
}, {
  id: 11,
  img: null,
  color: '#D3C8BA',
  text: 'Records',
}, {
  id: 12,
  img: null,
  color: '#000',
}, {
  id: 13,
  img: null,
  color: '#F8EDDE',
  text: 'Records',
}, {
  id: 14,
  img: FourteenhtPng,
  color: '#EEA6A6',
}];
