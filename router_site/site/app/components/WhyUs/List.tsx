import React, { Fragment } from 'react';
import css from './List.module.css';
import cn from 'classnames';
import { RollIn } from '~/animation/RollIn';

export function List(
  {
    list = [],
    className,
  }: {
    list: Array<{
      id: number;
      title: string;
      text: string;
      icon: React.ElementType;
    }>,
    className: string;
  },
) {


  return (
    <div className={cn(css.root, className)}>
      {list.map(({id, title, text, icon: Icon}, index) => (
        <Fragment key={id}>
          <RollIn index={index}>
            <Icon className={css.icon}/>
          </RollIn>

          <RollIn
            index={index}
            className={css.title}
          >
            {title}
          </RollIn>

          <RollIn
            index={index}
            className={css.text}
          >
            {text}
          </RollIn>
        </Fragment>
      ))}
    </div>
  );
}