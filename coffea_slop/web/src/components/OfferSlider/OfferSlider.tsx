'use client';

import { OfferEntity } from '@/model/offer.entity';
import { OfferCard } from '@/components/OfferCard';
import { Heading2 } from '@/widgets/heading/Heading2';
import css from './OfferSlider.module.css';

export function OfferSlider(
  {
    title,
    items,
    variant = 'dark',
  }: {
    title: string;
    items: OfferEntity[];
    icon?: string;
    variant?: 'dark' | 'light';
  },
) {
  return (
    <section className={`${css.section} ${variant === 'light' ? css.sectionLight : ''}`}>
      <Heading2 className={css.sectionHeader}>{title}</Heading2>

      <div className={css.sliderContainer}>
        <button className={`${css.navButton} ${css.navPrev}`} aria-label="Previous">
          ‹
        </button>

        <div className={css.productGrid}>
          {items.map((product) => (
            <OfferCard key={product.id} product={product}/>
          ))}
        </div>

        <button className={`${css.navButton} ${css.navNext}`} aria-label="Next">
          ›
        </button>
      </div>
    </section>
  );
}
