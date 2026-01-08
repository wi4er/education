import React from 'react';
import cn from 'classnames';
import css from './ButtonBig.module.css';
import txt from '@/fonts/text-styles.module.css';

export function ButtonBig(
  {
    text,
    icon,
    onClick,
    className,
  }: {
    text: string;
    icon?: React.ReactElement;
    onClick: () => void;
    className?: string;
  }
) {
  return (
    <button
      className={cn(css.wrap, txt.button, className)}
      onClick={onClick}
    >
      {text}

      {icon}
    </button>
  );
}