'use client';

import css from './JoinUsForm.module.css';
import { InputSmall } from '@/widgets/input';
import React from 'react';

export function JoinUsForm() {
  const [email, setEmail] = React.useState('')

  return (
    <section className={css.newsletter}>
      <p className={css.newsletterText}>
        Join us and get <span className={css.newsletterHighlight}>15% off</span>
      </p>

      <form className={css.newsletterForm} onSubmit={(e) => e.preventDefault()}>
        <InputSmall
          type={'email'}
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder={'Email address'}
        />

        <input
          type="email"
          placeholder="Enter your email address"
          className={css.newsletterInput}
        />

        <button type="submit" className={css.newsletterButton}>
          Subscribe
        </button>
      </form>
    </section>
  );
}
