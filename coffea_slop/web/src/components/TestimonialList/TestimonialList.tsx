"use client";

import {useState} from 'react';
import {Heading2} from '@/widgets/heading/Heading2';
import {TestimonialCard} from './TestimonialCard';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Pagination} from 'swiper/modules';
import 'swiper/swiper.css';
// import 'swiper/modules/pagination.css';
import css from './TestimonialList.module.css';
import personPng from './mock/Ellipse 2.png';
import {TestimonialView} from '@/model/testimonial.view';

const testimonials: Array<TestimonialView> = [
  {
    id: '1',
    image: personPng.src,
    name: 'James Smith',
    role: 'Entrepreneur',
    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing, Lorem ipsum dolor sit amet, consectetur adipisicing dolor sit amet, consectetur adipisicing elit, Lorem ipsum amet, consectetur adipisicing elit,Lorem ipsum dolor sit adipisicing elit, Lorem ipsum dolor sit dolor sit amet, consectetur adipisicing elit,',
    rating: 5,
  },
  {
    id: '2',
    image: personPng.src,
    name: 'James Smith',
    role: 'Entrepreneur',
    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing, Lorem ipsum dolor sit amet, consectetur adipisicing dolor sit amet, consectetur adipisicing elit, Lorem ipsum amet, consectetur adipisicing elit,Lorem ipsum dolor sit adipisicing elit, Lorem ipsum dolor sit dolor sit amet, consectetur adipisicing elit,',
    rating: 3,
  },
  {
    id: '3',
    image: personPng.src,
    name: 'James Smith',
    role: 'Entrepreneur',
    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing, Lorem ipsum dolor sit amet, consectetur adipisicing dolor sit amet, consectetur adipisicing elit, Lorem ipsum amet, consectetur adipisicing elit,Lorem ipsum dolor sit adipisicing elit, Lorem ipsum dolor sit dolor sit amet, consectetur adipisicing elit,',
    rating: 4,
  },
  {
    id: '4',
    image: personPng.src,
    name: 'James Smith',
    role: 'Entrepreneur',
    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing, Lorem ipsum dolor sit amet, consectetur adipisicing dolor sit amet, consectetur adipisicing elit, Lorem ipsum amet, consectetur adipisicing elit,Lorem ipsum dolor sit adipisicing elit, Lorem ipsum dolor sit dolor sit amet, consectetur adipisicing elit,',
    rating: 4,
  },
  {
    id: '5',
    image: personPng.src,
    name: 'James Smith',
    role: 'Entrepreneur',
    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing, Lorem ipsum dolor sit amet, consectetur adipisicing dolor sit amet, consectetur adipisicing elit, Lorem ipsum amet, consectetur adipisicing elit,Lorem ipsum dolor sit adipisicing elit, Lorem ipsum dolor sit dolor sit amet, consectetur adipisicing elit,',
    rating: 5,
  },
  {
    id: '6',
    image: personPng.src,
    name: 'James Smith',
    role: 'Entrepreneur',
    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing, Lorem ipsum dolor sit amet, consectetur adipisicing dolor sit amet, consectetur adipisicing elit, Lorem ipsum amet, consectetur adipisicing elit,Lorem ipsum dolor sit adipisicing elit, Lorem ipsum dolor sit dolor sit amet, consectetur adipisicing elit,',
    rating: 4,
  },
];

export function TestimonialList() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className={css.wrap}>
      <div className={css.title}>
        <p className={css.label}>
          Come and Join
        </p>

        <Heading2 className={css.header}>Our Happy Customers</Heading2>
      </div>

      <Swiper
        className={css.list}
        modules={[Pagination]}
        pagination={{
          clickable: true,
          bulletClass: css.pagination_item,
          bulletActiveClass: css.active,
          el: `.${css.pagination_list}`,
        }}
        slidesPerView={3}
        centeredSlides
        loop
        onSlideChange={swiper => setActiveIndex(swiper.realIndex)}
      >
        {testimonials.map((item, index) => (
          <SwiperSlide key={item.id}>
            <TestimonialCard
              item={item}
              active={index === activeIndex}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className={css.pagination_list}></div>
    </section>
  );
}
