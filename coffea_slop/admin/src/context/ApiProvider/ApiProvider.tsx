import { ReactNode } from 'react';
import { apiContext } from './ApiData';

const apiPath = '/api';

export function ApiProvider(
  {
    children,
  }: {
    children: ReactNode;
  },
) {
  return (
    <apiContext.Provider value={{
      getList: async <T,>(path: string): Promise<Array<T>> => {
        const res = await fetch(`${apiPath}/${path}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          throw await res.json().catch(() => new Error('Request failed'));
        }

        return res.json();
      },

      getItem: async <T,>(path: string, id: string): Promise<T> => {
        const url = id ? `${apiPath}/${path}/${id}` : `${apiPath}/${path}`;
        const res = await fetch(url, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          throw await res.json().catch(() => new Error('Request failed'));
        }

        return res.json();
      },

      postItem: async <T,>(path: string, data: object): Promise<T> => {
        const res = await fetch(`${apiPath}/${path}`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          throw await res.json().catch(() => new Error('Request failed'));
        }

        return res.json();
      },

      putItem: async <T,>(path: string, id: string, data: object): Promise<T> => {
        const res = await fetch(`${apiPath}/${path}/${id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          throw await res.json().catch(() => new Error('Request failed'));
        }

        return res.json();
      },

      deleteItem: async (path: string, id: string): Promise<void> => {
        const res = await fetch(`${apiPath}/${path}/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!res.ok) {
          throw await res.json().catch(() => new Error('Request failed'));
        }
      },
    }}>
      {children}
    </apiContext.Provider>
  );
}
