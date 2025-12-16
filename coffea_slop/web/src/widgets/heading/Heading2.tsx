import { ReactNode } from 'react';
import cn from 'classnames';
import css from './Heading2.module.css';
import txt from '@/fonts/text-styles.module.css';

export function Heading2(
  {
    children,
    className,
  }: {
    children: ReactNode;
    className: string;
  }
) {
  return (
    <h2 className={cn(css.wrap, className, txt.heading2)}>
      {children}
    </h2>
  );
}