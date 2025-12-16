'use client';

import Image from 'next/image';
import css from './MainBanner.module.css';

export function MainBanner() {
  return (
    <section className={css.hero}>
      <div className={css.heroContent}>
        <span className={css.heroLabel}>Welcome</span>
        <h1 className={css.heroTitle}>
          We serve the<br />
          <span className={css.heroAccent}>richest coffee</span> in<br />
          the city!
        </h1>
        <p className={css.heroSubtitle}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Sed do eiusmod tempor incididunt ut labore.
        </p>
        <button className={css.heroButton}>
          Order Now →
        </button>
      </div>
      <div className={css.heroVisual}>
        <Image
          src="/hero-coffee.png"
          alt="Premium coffee cup with latte art"
          width={450}
          height={450}
          className={css.heroCoffeeImage}
          priority
        />
      </div>
      <div className={css.heroDecorations}>
        <span className={`${css.heroDot} ${css.heroDotGold}`}></span>
        <span className={`${css.heroDot} ${css.heroDotBrown}`}></span>
      </div>
    </section>
  );
}
