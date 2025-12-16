import cn from 'classnames';
import css from './InputText.module.css';
import txt from '@/fonts/text-styles.module.css';
import { ChangeEvent } from 'react';

export function InputText(
  {
    value,
    onChange,
    placeholder,
    className,
  }: {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
  }
) {
  return (
    <input
      className={cn(css.input, txt.input, className)}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}
