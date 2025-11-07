import css from './index.module.css';
import { Social } from './Social';
import { Content } from '~/components/MainBanner/Content';
import bannerPng from './image/banner.png';

export function MainBanner() {
  return (
    <div className={css.root}>
      <div
        className={css.box}
        style={{
          backgroundImage: `url(${bannerPng})`,
        }}
      >
        <Content className={css.content}/>

        <Social className={css.social}/>
      </div>
    </div>
  );
}