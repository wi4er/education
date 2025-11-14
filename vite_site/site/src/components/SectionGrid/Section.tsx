import css from './Section.module.css';
import type { SectionItem } from './SectionItem.ts';
import cn from 'classnames';

export function Section(
  {
    item,
    className,
  }: {
    item: SectionItem;
    className: string;
  },
) {
  return (
    <div
      className={cn(css.root, className)}
      style={{
        backgroundColor: item.color,
      }}
    >
      {item.img ? <img src={item.img}/> : null}

      {item.text ? <div>{item.text}</div> : null}
    </div>
  );
}