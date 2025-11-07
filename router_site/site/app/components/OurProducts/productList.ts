import React from 'react';
import CreamSvg from './svg/cream.svg?react';
import SerumSvg from './svg/serum.svg?react';
import LotionSvg from './svg/lotion.svg?react';
import SunScreenSvg from './svg/sunscreen.svg?react';
import CoconutOilSvg from './svg/coconut-oil.svg?react';

export const productList: Array<{
  id: number;
  title: string;
  icon: React.ElementType,
}> = [{
  id: 1,
  title: 'Cream',
  icon: CreamSvg,
}, {
  id: 2,
  title: 'Serum',
  icon: SerumSvg,
}, {
  id: 3,
  title: 'Lotion',
  icon: LotionSvg,
}, {
  id: 4,
  title: 'Sunscreen',
  icon: SunScreenSvg,
}, {
  id: 5,
  title: 'Coconut Oil',
  icon: CoconutOilSvg,
}];