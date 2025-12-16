import { JoinUsForm } from '@/components/JoinUsForm';
import { TestimonialList } from '@/components/TestimonialList';
import { ExploreBanner } from '@/components/ExploreBanner';
import { OfferSlider } from '@/components/OfferSlider';
import { SectionList } from '@/components/SectionList';
import { MainBanner } from '@/components/MainBanner';
import { OfferEntity } from '@/model/offer.entity';
import HotCoffeeIcon from '@/components/SectionList/svg/hot-coffee.svg';
import ColdCoffeeIcon from '@/components/SectionList/svg/cold-coffee.svg';
import CupCoffeeIcon from '@/components/SectionList/svg/cup-coffee.svg';
import DessertIcon from '@/components/SectionList/svg/dessert.svg';
import css from './page.module.css';

const categories = [
  { icon: HotCoffeeIcon, label: 'Hot Coffee' },
  { icon: ColdCoffeeIcon, label: 'Cold Coffee' },
  { icon: CupCoffeeIcon, label: 'Cup Coffee' },
  { icon: DessertIcon, label: 'Dessert' },
];

const specialCoffee: OfferEntity[] = [
  { id: 1, name: 'Lungo coffee', desc: 'Smooth and aromatic blend', price: 'Rs. 350', image: '/products/lungo.jpg', badge: 'Best Seller' },
  { id: 2, name: 'Lungo coffee', desc: 'Rich espresso flavor', price: 'Rs. 380', image: '/products/lungo2.jpg' },
  { id: 3, name: 'Lungo coffee', desc: 'Dark roast perfection', price: 'Rs. 350', image: '/products/lungo3.jpg' },
  { id: 4, name: 'Lungo coffee', desc: 'Premium arabica beans', price: 'Rs. 400', image: '/products/lungo4.jpg' },
];

const specialDesserts: OfferEntity[] = [
  { id: 5, name: 'Lungo coffee', desc: 'With chocolate drizzle', price: 'Rs. 450', image: '/products/dessert1.jpg' },
  { id: 6, name: 'Lungo coffee', desc: 'Creamy cappuccino blend', price: 'Rs. 420', image: '/products/dessert2.jpg' },
  { id: 7, name: 'Lungo coffee', desc: 'Vanilla infused', price: 'Rs. 380', image: '/products/dessert3.jpg' },
  { id: 8, name: 'Lungo coffee', desc: 'Caramel delight', price: 'Rs. 400', image: '/products/dessert4.jpg' },
];

export default async function Home() {
  return (
    <div className={css.page}>
      <MainBanner />

      <SectionList categories={categories} />

      <OfferSlider
        title="Our Special Coffee"
        items={specialCoffee}
        icon="☕"
      />

      <OfferSlider
        title="Our Special Dessert"
        items={specialDesserts}
        icon="🍰"
        variant="light"
      />

      <ExploreBanner />

      <TestimonialList />

      <JoinUsForm />
    </div>
  );
}
