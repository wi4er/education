import css from './SectionList.module.css';
import { Item } from './Item';
import { SectionEntity } from '@/model/section.entity';

export function SectionList(
  {
    categories
  }: {
    categories: SectionEntity[];
  }
) {
  return (
    <section className={css.wrap}>
      {categories.map((cat) => (
        <Item
          key={cat.label}
          icon={cat.icon}
          label={cat.label}
        />
      ))}
    </section>
  );
}
