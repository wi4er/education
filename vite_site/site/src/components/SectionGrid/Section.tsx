import css from './Section.module.css';
import font from '../../fonts/text-style.module.css';
import type { SectionItem } from './SectionItem.ts';
import cn from 'classnames';
import * as React from 'react';
import { SwapText } from '../../animation/SwapText.tsx';
import { ScrollReveal } from '../../animation/ScrollReveal.tsx';

export function Section(
  {
    item,
    className,
  }: {
    item: SectionItem;
    className: string;
  },
) {
  const [hover, setHover] = React.useState(false);

  return (
    <ScrollReveal
      className={cn(css.root, className, font.paragraph_1)}
      style={{ backgroundColor: item.color }}
      onHoverChange={setHover}
    >
      {item.img ? <img src={item.img}/> : null}

      {item.text ? <SwapText swap={hover}>{item.text}</SwapText> : null}
    </ScrollReveal>
  );
}
