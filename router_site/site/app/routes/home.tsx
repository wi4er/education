import type { Route } from './+types/home';
import { WhyUs } from '~/components/WhyUs';
import { Customers } from '~/components/Customers';
import { OurProducts } from '~/components/OurProducts';
import { AboutUs } from '~/components/AboutUs';
import { Companies } from '~/components/Companies';
import { Testimonials } from '~/components/Testimonials';
import { MainBanner } from '~/components/MainBanner';
import { SubscribeForm } from '~/components/SubscribeForm';

export function meta({}: Route.MetaArgs) {
  return [
    {title: 'New React Router App'},
    {name: 'description', content: 'Welcome to React Router!'},
  ];
}

export async function loader() {
  return {
    abc: 123,
  };
}

export default function Home(
  loaderData: {abc: number},
) {
  return (
    <main>
      <MainBanner />

      <Customers />

      <WhyUs />

      <AboutUs />

      <OurProducts />

      <Testimonials />

      <Companies />

      <SubscribeForm />
    </main>
  );
}
