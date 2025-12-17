import { ReactNode, createContext } from 'react';

const apiPath = '/api';


export interface ApiData {
  getData: <T>(url: string) => Promise<
    { status: true; data: Array<T>; }
    | { status: false, error: any }
  >;
  getItem: <T>(url: string) => Promise<
    { status: true; data: T; }
    | { status: false, error: any }
  >;
  postData: <T>(url: string, data: Object) => Promise<
    { status: true; data: T; }
    | { status: false, error: any }
  >;
  putData: <T>(url: string, data: Object) => Promise<
    { status: true; data: T; }
    | { status: false, error: any }
  >;
  deleteData: (url: string) => Promise<
    { status: true; }
    | { status: false, error: any }
  >;
}

export const apiContext = createContext<ApiData>({} as ApiData);

export function ApiContext(
  {
    children,
  }: {
    children: ReactNode;
  },
) {
  return (
    <apiContext.Provider value={{
      getData: (path: string) => {
        return fetch(`${apiPath}/${path}`, {
          method: 'GET',
          credentials: 'include',
        }).then(res => {
          if (!res.ok) return {status: false, error: null};
          return res.json();
        });
      },
      getItem: (path: string) => {
        return fetch(`${apiPath}/${path}`, {
          method: 'GET',
          credentials: 'include',
        }).then(res => {
          if (!res.ok) return {status: false, error: null};
          return res.json();
        });
      },
      postData: (path: string, data: Object) => {
        return fetch(`${apiPath}/${path}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then(res => {
          if (!res.ok) return {status: false, error: null};
          return res.json();
        });
      },
      putData: (path: string, data: Object) => {
        return fetch(`${apiPath}/${path}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }).then(res => {
          if (!res.ok) return {status: false, error: null};
          return res.json();
        });
      },
      deleteData: (path: string) => {
        return fetch(`${apiPath}/${path}`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(res => {
          if (!res.ok) return {status: false, error: null};
          return res.json();
        });
      },
    }}>
      {children}
    </apiContext.Provider>
  );
}