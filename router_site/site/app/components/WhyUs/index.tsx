import React from 'react';
import css from './index.module.css';

import { List } from './List';
import { whyList } from '~/components/WhyUs/mock/why-list';

export function WhyUs(
  {
    list = whyList,
  }: {
    list?: typeof whyList;
  },
) {
  return (
    <div className={css.root}>
      <h2 className={css.title}>
        Why dangila?
      </h2>

      <div className={css.text}>
        Yourself required no at thoughts delicate landlord it be. Branched dashwood do
        is whatever it. Farther be chapter at visited married in it pressed.
      </div>

      <List
        className={css.list}
        list={list}
      />
    </div>
  );
}