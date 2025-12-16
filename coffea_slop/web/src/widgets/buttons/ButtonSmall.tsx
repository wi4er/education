import cn from 'classnames';
import css from './ButtonSmall.module.css';
import txt from '@/fonts/text-styles.module.css';
import React from 'react';

export function ButtonSmall(
  {
    text,
    onClick,
  }: {
    text: string;
    onClick: () => void;
  },
) {
  return (
    <button
      className={cn(css.wrap, txt.button)}
      onClick={onClick}
    >
      {text}
    </button>
  );
}