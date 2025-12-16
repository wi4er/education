import { Heading2 } from '@/widgets/heading/Heading2';
import css from './TestimonialList.module.css';

const testimonials = [
  {
    id: 1,
    image: '/testimonials/customer1.jpg',
    text: '"The best coffee I have ever tasted! The ambiance is perfect for both work and relaxation."',
    name: 'Sarah Johnson',
  },
  {
    id: 2,
    image: '/testimonials/customer2.jpg',
    text: '"Amazing coffee and even better service. This has become my go-to spot every morning."',
    name: 'Michael Chen',
  },
  {
    id: 3,
    image: '/testimonials/customer3.jpg',
    text: '"The attention to detail in every cup is remarkable. Truly a premium coffee experience."',
    name: 'Emma Davis',
  },
];

export function TestimonialList() {
  return (
    <section className={css.testimonials}>
      <p className={css.testimonialsLabel}>Come and Join</p>

      <Heading2 className={css.testimonialsTitle}>Our Happy Customers</Heading2>

      <div className={css.testimonialsGrid}>
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className={css.testimonialCard}>
            <div
              className={css.testimonialImage}
              style={{ background: '#d4c4b0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}
            >
              👤
            </div>
            <p className={css.testimonialText}>{testimonial.text}</p>
            <p className={css.testimonialName}>{testimonial.name}</p>
          </div>
        ))}
      </div>
      <div className={css.testimonialDots}>
        <span className={`${css.testimonialDot} ${css.testimonialDotActive}`}></span>
        <span className={css.testimonialDot}></span>
        <span className={css.testimonialDot}></span>
      </div>
    </section>
  );
}
