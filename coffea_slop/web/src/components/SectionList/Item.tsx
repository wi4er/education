import css from './Item.module.css';
import txt from '@/fonts/text-styles.module.css';
import cn from 'classnames';
import { ComponentType, SVGProps } from 'react';

export function Item(
  {
    icon: Icon,
    label
  }: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
  }
) {
  return (
    <div className={css.item}>
      <Icon className={css.icon} />

      <span className={cn(css.label, txt.caption)}>{label}</span>
    </div>
  );
}
