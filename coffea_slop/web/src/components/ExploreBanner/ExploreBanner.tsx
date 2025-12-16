'use client';

import Image from 'next/image';
import css from './ExploreBanner.module.css';
import leftBannerPng from './img/left-banner.png';
import rightBannerPng from './img/right-banner.png';
import { ButtonBig } from '@/widgets/buttons/ButtonBig';
import { Heading2 } from '@/widgets/heading/Heading2';
import ArrowsSvg from './svg/double-arrows.svg';

export function ExploreBanner() {
  return (
    <section className={css.wrap}>
      <picture className={css.imageLeft}>
        <Image
          src={leftBannerPng.src}
          alt="Coffee beans"
          width={300}
          height={200}
          className={css.beansImage}
        />
      </picture>

      <div className={css.content}>
        <Heading2 className={css.title}>
          Check Out Our Best<br />Coffee Beans
        </Heading2>

        <ButtonBig
          text={'Explore Out Products'}
          icon={<ArrowsSvg />}
          onClick={() => {}}
        />
      </div>

      <div className={css.imageRight}>
        <Image
          src={rightBannerPng.src}
          alt="Coffee beans"
          width={300}
          height={200}
          className={css.beansImage}
        />
      </div>
    </section>
  );
}
