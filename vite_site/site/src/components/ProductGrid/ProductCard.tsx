import css from './ProductCard.module.css';
import font from '../../fonts/text-style.module.css';
import type { ProductItem } from './ProductItem.ts';
import cn from 'classnames';
import * as React from 'react';
import { SwapText } from '../../animation/SwapText.tsx';
import { ScrollReveal } from '../../animation/ScrollReveal.tsx';

export function ProductCard({
  item,
  className,
}: {
  item: ProductItem;
  className?: string;
}) {
  const [hover, setHover] = React.useState(false);

  return (
    <ScrollReveal
      className={cn(css.root, className)}
      onHoverChange={setHover}
    >
      <picture className={css.picture}>
        <img className={css.image} src={item.img} alt={item.title} />
      </picture>

      <div className={css.content}>
        <h3 className={cn(css.title, font.heading_5)}>
          <SwapText swap={hover}>{item.title}</SwapText>
        </h3>

        <span className={cn(css.price, font.caption)}>
          ${item.price}
        </span>

        <p className={cn(css.description, font.caption)}>
          {item.description}
        </p>
      </div>
    </ScrollReveal>
  );
}
