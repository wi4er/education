import css from './index.module.css';
import { Section } from './Section.tsx';
import type { SectionItem } from './SectionItem.ts';
import { sectionList } from './mock/section-list.ts';
import cn from 'classnames';

export function SectionGrid(
  {
    list = sectionList,
  }: {
    list?: Array<SectionItem>;
  },
) {
  return (
    <div className={css.root}>
      {list.map(item => (
        <Section
          className={cn(css.item)}
          item={item}
          key={item.id}
        />
      ))}
    </div>
  );
}
