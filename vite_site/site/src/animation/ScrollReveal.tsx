import * as React from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function ScrollReveal({
  children,
  className,
  style,
  onHoverChange,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onHoverChange?: (hover: boolean) => void;
}) {
  const node = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (window.innerHeight > (node.current?.getBoundingClientRect()?.top ?? 0) + window.scrollY) return;

    gsap.from(node.current, {
      scrollTrigger: {
        trigger: node.current,
        start: 'top bottom',
        end: 'top 80%',
        scrub: true,
        toggleActions: 'play none none none',
      },
      y: 50,
      opacity: 0,
      duration: 1,
      scale: 0.9,
    });
  }, [node.current]);

  return (
    <div
      className={className}
      style={style}
      ref={node}
      onMouseEnter={onHoverChange ? () => onHoverChange(true) : undefined}
      onMouseLeave={onHoverChange ? () => onHoverChange(false) : undefined}
    >
      {children}
    </div>
  );
}
