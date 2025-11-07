import css from './Icons.module.css';
import cn from 'classnames';
import SearchSvg from './svg/search.svg?react';
import BasketSvg from './svg/basket.svg?react';
import PersonSvg from './svg/person.svg?react';

export function Icons(
  {
    className,
  }: {
    className: string;
  },
) {
  return (
    <div className={cn(css.root, className)}>
      <button
        className={css.button}
        aria-label={'search'}
      >
        <SearchSvg/>
      </button>

      <button
        className={css.button}
        aria-label={'basket'}
      >
        <BasketSvg/>
      </button>

      <button
        className={css.button}
        aria-label={'personal'}
      >
        <PersonSvg/>
      </button>
    </div>
  );
}