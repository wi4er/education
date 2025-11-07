import css from './index.module.css';
import { testimonialList } from './testimonial-list';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.css';
import { Item } from './Item';
import cn from 'classnames';

export function Testimonials(
  {
    list = testimonialList,
  },
) {
  return (
    <div className={css.root}>
      <h2 className={css.title}>
        TESTIMONIALS
      </h2>

      <Swiper
        className={css.list}
        slidesPerView={'auto'}
        loop={true}
        spaceBetween={30}
        centeredSlides={true}
      >
        {list.map(item => (
          <SwiperSlide
            style={{width: '57%'}}
            key={item.id}
          >
            <Item item={item}/>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}