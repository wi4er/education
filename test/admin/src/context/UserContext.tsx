import css from './UserContext.module.css';
import React from 'react';

export const userContext = React.createContext<any>({});

export function UserContext(
  {
    children,
  }: {
    children: React.ReactNode;
  },
) {
  const [user, setUser] = React.useReducer((state: any, action: any) => {

    return action.user;
  }, undefined);

  React.useEffect(() => {
    fetch('http://localhost:3000/users/me', {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.json()).then(res => {
      console.log(res);
      if (res.status) setUser({user: res.user})
      else setUser({user: null});
    });
  }, []);

  return (
    <userContext.Provider value={{
      user,
      fetchUser: (email: string, password: string) => {
        fetch('http://localhost:3000/users/sign_in', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify({email, password}),
        }).then(res => res.json()).then(res => {
          if (res.status) setUser({user: res.user});
        });
      },
      logout: () => {
        console.log('LOG OUT');
      },
    }}>
      {children}
    </userContext.Provider>
  );
}