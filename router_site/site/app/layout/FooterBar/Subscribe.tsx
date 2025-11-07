import css from './Subscribe.module.css';
import cn from 'classnames';

export function Subscribe(
  {
    className,
  }: {
    className: string;
  }
) {
  return (
    <div className={cn(css.root, className)}>
      <div  className={css.text}>
        Receive special offers and  get our latest updates.
      </div>

      <form className={css.email}>
        <input
          className={css.input}
          placeholder={'Enter e-mail'}
        />

        <button
          className={css.button}
          aria-label={'Join'}
        >
          Join
        </button>
      </form>
    </div>
  );
}