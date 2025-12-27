'use client';

import { useState } from 'react';
import Image from 'next/image';
import css from './SplashScreen.module.css';
import Vecs from './svg/Vecs.svg';
import logoPng from './svg/Logo.png';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2000 }: SplashScreenProps) {
  const [isFading] = useState(false);

  return (
    <div className={`${css.splash} ${isFading ? css.fadeOut : ''}`}>
      <div className={css.background} />

      <Vecs className={css.vecs} />

      <div className={css.content}>
        <div className={css.container}>
          <h1 className={css.title}>By Invite Only</h1>
          <div className={css.logoWrapper}>
            <Image src={logoPng} alt="Byio Logo" className={css.logo} priority />
          </div>
        </div>
      </div>
    </div>
  );
}
