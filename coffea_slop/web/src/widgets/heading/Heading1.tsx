import React from 'react';
import cn from 'classnames';
import css from './Heading1.module.css';
import txt from '@/fonts/text-styles.module.css';

export function Heading1(
  {
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  },
) {
  return (
    <h1 className={cn(css.wrap, className, txt.heading1)}>
      {children}
    </h1>
  );
}