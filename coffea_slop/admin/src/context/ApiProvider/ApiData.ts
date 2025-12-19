import { createContext } from 'react';

export interface ApiData {
  getList: <T>(url: string) => Promise<Array<T>>;
  getItem: <T>(url: string) => Promise<T>;
  postItem: <T>(url: string, data: object) => Promise<T>;
  putItem: <T>(url: string, data: object) => Promise<T>;
  deleteItem: (url: string) => Promise<void>;
}

export const apiContext = createContext<ApiData>({} as ApiData);
