import { useContext } from 'react';
import { apiContext } from './ApiData';

export function usePut() {
  const { putItem } = useContext(apiContext);

  return putItem;
}
