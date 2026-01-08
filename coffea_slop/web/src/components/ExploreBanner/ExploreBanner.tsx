'use client';

import Image from 'next/image';
import css from './ExploreBanner.module.css';
import leftBannerPng from './img/left-banner.png';
import rightBannerPng from './img/right-banner.png';
import { ButtonBig } from '@/widgets/buttons/ButtonBig';
import { Heading2 } from '@/widgets/heading/Heading2';
import ArrowsSvg from './svg/double-arrows.svg';
import cn from 'classnames';
import txt from '@/fonts/text-styles.module.css';

export function ExploreBanner() {
  return (
    <section className={css.wrap}>
      <picture className={css.imageLeft}>
        <img
          src={leftBannerPng.src}
          alt="Coffee beans"
          className={css.beansImage}
        />
      </picture>

      <div className={css.content}>
        <Heading2 className={cn(css.title, txt.heading2)}>
          Check Out Our Best<br />Coffee Beans
        </Heading2>

        <ButtonBig
          className={css.button}
          text={'Explore Out Products'}
          icon={<ArrowsSvg />}
          onClick={() => {}}
        />
      </div>

      <picture className={css.imageRight}>
        <img
          src={rightBannerPng.src}
          alt="Coffee beans"
          className={css.beansImage}
        />
      </picture>
    </section>
  );
}
