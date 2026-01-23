import { createContext } from 'react';

export interface ApiData {
  getList: <T>(url: string) => Promise<Array<T>>;
  getItem: <T>(path: string, id: string) => Promise<T>;
  postItem: <T>(url: string, data: object) => Promise<T>;
  putItem: <T>(path: string, id: string, data: object) => Promise<T>;
  deleteItem: (path: string, id: string) => Promise<void>;
}

export const apiContext = createContext<ApiData>({} as ApiData);
