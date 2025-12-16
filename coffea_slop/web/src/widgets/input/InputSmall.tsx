import cn from 'classnames';
import css from './InputSmall.module.css';
import txt from '@/fonts/text-styles.module.css';
import EmailSvg from './svg/email.svg';
import { ChangeEvent } from 'react';

export function InputSmall(
  {
    type = 'string',
    value,
    onChange,
    placeholder,
    className,
  }: {
    type?: 'string' | 'email'
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
  }
) {
  return (
    <div className={cn(css.wrap, txt.input, className)}>
      {type === 'email' && <EmailSvg />}

      <input
        className={cn(css.input, txt.input)}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}