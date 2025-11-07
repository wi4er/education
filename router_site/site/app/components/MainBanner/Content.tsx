import css from './Content.module.css';
import cn from 'classnames';

export function Content(
  {
    className,
  }: {
    className: string;
  }
) {
  return (
    <div className={cn(css.root, className)}>
      <h1 className={css.title}>
        dangila
      </h1>

      <div className={css.subtitle}>
        Natural Inner Beauty
      </div>

      <div className={css.text}>
        Provide deluxe hydration for those with dry or age-related skin concerns. They add intense moisture to
        dehydrated or mature skin, alleviating uneven, sun-damaged textures to promote natural radiance.
      </div>

      <button className={css.button}>
        Buy Now

        <span className={css.stick} />

        $49.99
      </button>
    </div>
  );
}