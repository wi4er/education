import { useContext } from 'react';
import { apiContext } from './ApiData';

export function useApi() {
  return useContext(apiContext);
}
