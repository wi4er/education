import { createContext } from 'react';
import { ApiEntity } from './ApiEntity';

export interface Pagination {
  limit?: number;
  offset?: number;
}

export interface ListResponse<T> {
  data: T[];
  count: number;
}

export interface ApiData {
  getList: <T>(path: ApiEntity, pagination?: Pagination) => Promise<ListResponse<T>>;
  getItem: <T>(path: string, id: string) => Promise<T>;
  postItem: <T>(url: string, data: object) => Promise<T>;
  putItem: <T>(path: string, id: string, data: object) => Promise<T>;
  deleteItem: (path: string, id: string) => Promise<void>;
}

export const apiContext = createContext<ApiData>({} as ApiData);
