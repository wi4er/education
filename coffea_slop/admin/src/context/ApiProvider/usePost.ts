import { useContext } from 'react';
import { apiContext } from './ApiData';

export function usePost() {
  const { postItem } = useContext(apiContext);

  return postItem;
}
