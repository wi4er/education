import css from './SignUp.module.css';
import font from '../../fonts/text-style.module.css';
import cn from 'classnames';
import ArrowSvg from './svg/arrow-up-right.svg?react';

export function SignUp(
  {
    className,
    onClick,
  }: {
    className: string;
    onClick: () => void;
  }
) {
  return (
    <div
      className={cn(css.root, className, font.heading_4)}
      onClick={onClick}
    >
      <div className={css.text}>
        Sign Up for our Newsletter
      </div>

      <ArrowSvg
        className={css.arrow}
      />
    </div>
  );
}