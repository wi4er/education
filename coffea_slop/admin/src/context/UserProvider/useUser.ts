import { useContext } from 'react';
import { userContext } from './UserData';

export function useUser() {
  return useContext(userContext);
}
