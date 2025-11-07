import React, { Fragment } from 'react';
import css from './index.module.css';
import { productList } from './productList';
import { RollIn } from '~/animation/RollIn';

export function OurProducts(
  {
    list = productList,
  },
) {
  return (
    <div className={css.root}>
      <h2 className={css.title}>
        Our Products
      </h2>

      {list.map(({id, title, icon: Icon}, index) => (
        <Fragment key={id}>
          <RollIn
            className={css.icon}
            index={index / 1.5}
          >
            <Icon/>
          </RollIn>

          <RollIn
            className={css.name}
            index={index / 2}
          >
            {title}
          </RollIn>
        </Fragment>
      ))}
    </div>
  );
}