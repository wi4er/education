import css from './Item.module.css';
import CloseSvg from './svg/close.svg?react';
import OpenSvg from './svg/open.svg?react';

export function Item(
  {
    item,
  }: {
    item: Object,
  },
) {
  return (
    <div className={css.root}>
      <div className={css.box}>
        <div className={css.text}>
          <OpenSvg className={css.open} />
          {item.text}

          <CloseSvg className={css.close} />
        </div>

        <img
          src={item.image}
          className={css.image}
          alt={item.text}
        />
      </div>
    </div>
  );
}