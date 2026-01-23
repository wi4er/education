import { ReactNode } from 'react';
import { apiContext, Pagination } from './ApiData';
import { ApiEntity } from './ApiEntity';

const apiPath = process.env.API_PATH ?? '/api';

export function ApiProvider(
  {
    children,
  }: {
    children: ReactNode;
  },
) {
  return (
    <apiContext.Provider value={{
      getList: async <T,>(path: ApiEntity, pagination?: Pagination): Promise<Array<T>> => {
        const params = new URLSearchParams();
        if (pagination?.limit !== undefined) params.set('limit', String(pagination.limit));
        if (pagination?.offset !== undefined) params.set('offset', String(pagination.offset));
        const query = params.toString();
        const url = query ? `${apiPath}/${path}?${query}` : `${apiPath}/${path}`;

        const res = await fetch(url, {
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
