import css from './index.module.css';
import { companyList } from './mock/company-list';
import { RollIn } from '~/animation/RollIn';

export function Companies(
  {
    list = companyList,
  }: {
    list: typeof companyList;
  },
) {
  return (
    <div className={css.root}>
      {list.map((item, index) => (
        <RollIn
          index={index / 1.5}
          className={css.item}
          key={item.image}
        >
          <img
            src={item.image}
            alt={item.name}
            title={item.name}
          />
        </RollIn>
      ))}
    </div>
  );
}