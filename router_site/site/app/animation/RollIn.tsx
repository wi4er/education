import React, { type RefObject } from 'react';
import { gsap } from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export function RollIn(
  {
    children,
    index,
    className,
  }: {
    children: React.ReactNode;
    index: number;
    className?: string;
  },
) {
  const ref: RefObject<HTMLDivElement | null> = React.createRef();

  useGSAP(() => {
    gsap.from(ref.current, {
      scrollTrigger: {
        trigger: ref.current,
        start: `top ${100 - index * 5}%`,
        end: `top ${90 - index * 5}%`,
        scrub: true,
        toggleActions: 'play none none none',
      },
      y: 50,
      opacity: 0,
      duration: 1,
      scale: .9,
    });
  });

  return (
    <div
      className={className}
      ref={ref}
    >
      {children}
    </div>
  );
}