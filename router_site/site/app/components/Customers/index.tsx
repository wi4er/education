import css from './index.module.css';
import { RollIn } from '~/animation/RollIn';
import { customerList } from './mock/customer-list';
import { Fragment } from 'react';


export function Customers(
  {
    list = customerList,
  }: {
    list: typeof customerList;
  },
) {
  return (
    <div className={css.root}>
      {list.map(({id, count, text}, index) => (
        <Fragment key={id}>
          <RollIn
            className={css.count}
            index={index}
          >
            {count}
          </RollIn>

          <RollIn
            className={css.text}
            index={index}
          >
            {text}
          </RollIn>
        </Fragment>
      ))}
    </div>
  );
}