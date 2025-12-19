import { useContext } from 'react';
import { apiContext } from './ApiData';

export function useDelete() {
  const { deleteItem } = useContext(apiContext);

  return deleteItem;
}
