import Link from 'next/link';
import css from './Footer.module.css';

export function Footer() {
  return (
    <footer className={css.footer}>
      <div className={css.footerContent}>
        <div className={css.footerBrand}>
          <div className={css.footerLogo}>Coffea</div>
          <p className={css.footerTagline}>
            Serving the finest coffee since 2010. Every cup tells a story of
            passion and craftsmanship.
          </p>
        </div>
        <div className={css.footerColumn}>
          <h4>Menu</h4>
          <ul>
            <li><Link href="/menu/coffee">Coffee</Link></li>
            <li><Link href="/menu/tea">Tea</Link></li>
            <li><Link href="/menu/desserts">Desserts</Link></li>
            <li><Link href="/menu/snacks">Snacks</Link></li>
          </ul>
        </div>
        <div className={css.footerColumn}>
          <h4>About Us</h4>
          <ul>
            <li><Link href="/about">Our Story</Link></li>
            <li><Link href="/about/team">Our Team</Link></li>
            <li><Link href="/careers">Careers</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </div>
        <div className={css.footerColumn}>
          <h4>Support</h4>
          <ul>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/shipping">Shipping</Link></li>
            <li><Link href="/returns">Returns</Link></li>
          </ul>
        </div>
        <div className={css.footerColumn}>
          <h4>Social Media</h4>
          <div className={css.footerSocial}>
            <a href="#" className={css.socialIcon} aria-label="Facebook">f</a>
            <a href="#" className={css.socialIcon} aria-label="Instagram">ig</a>
            <a href="#" className={css.socialIcon} aria-label="Twitter">x</a>
          </div>
        </div>
      </div>
      <div className={css.footerBottom}>
        <p className={css.footerCopyright}>
          &copy; 2024 Coffea. All rights reserved.
        </p>
        <div className={css.footerPayments}>
          <span className={css.paymentIcon}>VISA</span>
          <span className={css.paymentIcon}>MC</span>
          <span className={css.paymentIcon}>AMEX</span>
          <span className={css.paymentIcon}>PP</span>
        </div>
      </div>
    </footer>
  );
}
