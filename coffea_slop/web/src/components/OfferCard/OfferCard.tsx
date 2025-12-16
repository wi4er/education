'use client';

import { useState } from 'react';
import { OfferEntity } from '@/model/offer.entity';
import css from './OfferCard.module.css';
import offerPng from './mock/offer_1.png';

export function OfferCard({
  product,
}: {
  product: OfferEntity;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className={css.card}>
      <div className={css.imageWrapper}>
        <img
          className={css.image}
          src={offerPng.src}
          alt={product.name}
        />
        <button
          className={`${css.favoriteButton} ${isFavorite ? css.favoriteActive : ''}`}
          onClick={() => setIsFavorite(!isFavorite)}
          aria-label="Add to favorites"
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>
      <div className={css.info}>
        <h3 className={css.name}>{product.name}</h3>
        <p className={css.desc}>{product.desc}</p>
        <div className={css.footer}>
          <span className={css.price}>{product.price}</span>
          <button className={css.orderButton}>Order Now</button>
        </div>
      </div>
    </div>
  );
}
