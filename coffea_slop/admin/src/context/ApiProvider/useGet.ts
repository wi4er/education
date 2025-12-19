import { useContext } from 'react';
import { apiContext } from './ApiData';

export function useGet() {
  const { getList } = useContext(apiContext);

  return getList;
}
