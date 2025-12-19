import { createContext } from 'react';

export interface SignInEntity {

  id: string;
  login: string;

}

export interface UserData {
  user: SignInEntity | null | undefined;
  logIn: (login: string, password: string) => Promise<SignInEntity>;
  logOut: () => Promise<void>;
}

export const userContext = createContext<UserData>({} as UserData);
