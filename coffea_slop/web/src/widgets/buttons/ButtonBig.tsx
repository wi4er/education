import React from 'react';
import cn from 'classnames';
import css from './ButtonBig.module.css';
import txt from '@/fonts/text-styles.module.css';


export function ButtonBig(
  {
    text,
    icon,
    onClick,
  }: {
    text: string;
    icon?: React.ReactElement;
    onClick: () => void;
  }
) {
  return (
    <button
      className={cn(css.wrap, txt.button)}
      onClick={onClick}
    >
      {text}

      {icon}
    </button>
  );
}