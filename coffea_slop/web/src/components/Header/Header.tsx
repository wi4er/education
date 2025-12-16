'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import css from './Header.module.css';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${css.header} ${isScrolled ? css.headerScrolled : ''}`}>
      <Link href="/" className={css.logo}>
        Coffea
      </Link>
      <nav className={css.nav}>
        <Link href="/" className={css.navLink}>Home</Link>
        <Link href="/menu" className={css.navLink}>Menu</Link>
        <Link href="/about" className={css.navLink}>About Us</Link>
        <Link href="/services" className={css.navLink}>Services</Link>
        <Link href="/contact" className={css.navLink}>Contact</Link>
      </nav>
      <div className={css.headerIcons}>
        <button className={css.iconButton} aria-label="Search">🔍</button>
        <button className={css.iconButton} aria-label="Cart">🛒</button>
      </div>
    </header>
  );
}
