import { useContext } from 'react';
import { apiContext } from './ApiData';

export function useGetItem() {
  const { getItem } = useContext(apiContext);

  return getItem;
}
