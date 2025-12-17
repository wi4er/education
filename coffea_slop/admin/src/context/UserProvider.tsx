import React from 'react';
import { apiContext } from './ApiProvider';
import { UserEntity } from '../model/user.entity';
import { AuthForm } from '../component/AuthForm';

export interface UserData {
  user: UserEntity | null | undefined,
  logIn: (email: string, password: string) => Promise<{
    status: true;
    data: UserEntity;
  } | {
    status: false;
    error: any;
  }>

  logOut: () => Promise<{
    status: true;
  } | {
    status: false;
  }>
}

export const userContext = React.createContext<UserData>({} as UserData);

export function UserContext(
  {
    children,
  }: {
    children: React.ReactNode;
  },
) {
  const {getData, getItem, postData, deleteData} = React.useContext(apiContext);
  const [user, setUser] = React.useState<UserEntity | null | undefined>(undefined);

  React.useEffect(() => {
    getItem<UserEntity>('session/myself').then(res => {
      if (res.status) {
        if (res.data.role === 'admin') {
          setUser(res.data);
        } else {
          setUser(null);
        }
      } else setUser(null);
    });
  }, []);

  return (
    <userContext.Provider value={{
      user,
      logIn: (email: string, password: string) => {
        return postData<UserEntity>('session/myself', {email, password}).then(res => {
          if (
            res.status
            && res.data.role === 'admin'
          ) {
            setUser(res.data);
          } else {
            setUser(null);
          }

          return res;
        });
      },
      logOut: () => {
        return deleteData('session/sign_out').then((res: any) => {
          if (res.status) {
            setUser(null);
            return {status: true};
          } else {
            return {status: false};
          }
        });
      },
    }}>
      {user === null ? <AuthForm/> : null}
      {user ? children : null}
    </userContext.Provider>
  );
}