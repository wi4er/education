import './fonts/Rubik_Bubbles/font.css';
import './fonts/Rubik/font.css';
import './fonts/Fragment_Mono/font.css';
import 'swiper/swiper.css';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router.tsx';

function App() {
  return <RouterProvider router={router}/>;
}

export default App;
