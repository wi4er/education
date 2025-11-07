import css from './Email.module.css';
import cn from 'classnames';
import { RollIn } from '~/animation/RollIn';

export function Email(
  {
    className,
  }: {
    className: string;
  },
) {
  return (
    <form className={cn(css.root, className)}>
      <RollIn index={0} className={css.label}>
        <input
          className={css.input}
          placeholder={'Enter your email.'}
          type={'email'}
        />
      </RollIn>

      <RollIn index={1}>
        <button
          className={css.button}
          aria-label={'Get Started'}
        >
          Get Started
        </button>
      </RollIn>
    </form>
  );
}