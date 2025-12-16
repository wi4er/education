import { useContext } from 'react';
import { userContext } from './userContext';

export function useUser() {
  const context = useContext(userContext);

  if (!context) {
    throw new Error('')
  }

  return context;
}