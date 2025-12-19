import { useContext } from 'react';
import { userContext } from './UserData';

export function useLogIn() {
  const { logIn } = useContext(userContext);

  return logIn;
}
