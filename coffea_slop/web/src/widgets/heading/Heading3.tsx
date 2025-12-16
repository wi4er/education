import { ReactNode } from 'react';
import cn from 'classnames';
import css from '@/widgets/heading/Heading3.module.css';
import txt from '@/fonts/text-styles.module.css';

export function Heading3(
  {
    children,
    className,
  }: {
    children: ReactNode;
    className: string;
  }
) {
  return (
    <h2 className={cn(css.wrap, className, txt.heading3)}>
      {children}
    </h2>
  );
}