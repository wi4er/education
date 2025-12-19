import { useContext } from 'react';
import { userContext } from './UserData';

export function useLogOut() {
  const { logOut } = useContext(userContext);

  return logOut;
}
