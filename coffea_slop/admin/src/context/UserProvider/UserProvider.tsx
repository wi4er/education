import { ReactNode, useContext, useState, useEffect } from 'react';
import { apiContext } from '../ApiProvider';
import { AuthForm } from '../../component/personal/AuthForm';
import { userContext, SignInEntity } from './UserData';

export function UserProvider(
  {
    children,
  }: {
    children: ReactNode;
  },
) {
  const { getItem, postItem, deleteItem } = useContext(apiContext);
  const [user, setUser] = useState<SignInEntity | null | undefined>(undefined);

  useEffect(() => {
    getItem<SignInEntity>('sign-in')
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <userContext.Provider value={{
      user,
      logIn: (login: string, password: string) => {
        return postItem<SignInEntity>('sign-in', { login, password })
          .then(data => {
            setUser(data);
            return data;
          })
          .catch(error => {
            setUser(null);
            throw error;
          });
      },
      logOut: () => {
        return deleteItem('sign-in')
          .then(() => setUser(null));
      },
    }}>
      {user === null ? <AuthForm /> : null}
      {user ? children : null}
    </userContext.Provider>
  );
}
