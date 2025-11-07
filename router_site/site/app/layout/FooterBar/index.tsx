import css from './index.module.css';
import { Social } from './Social';
import { Menu } from './Menu';
import { Contacts } from '~/layout/FooterBar/Contacts';
import { Subscribe } from '~/layout/FooterBar/Subscribe';

export function FooterBar() {
  return (
    <footer className={css.root}>
      <div className={css.column1}>
        <div className={css.text}>
          Learn To Love Growth And Change And You Will Be A Success.
        </div>

        <Social/>
      </div>

      <Menu className={css.column2}/>

      <Contacts className={css.column3} />

      <Subscribe className={css.column4} />
    </footer>
  );
}