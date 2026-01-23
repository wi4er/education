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

export interface DeleteResponse<T> {
  data: T;
  deletedAt: string;
}

export interface ApiData {
  getList: <T>(path: ApiEntity, pagination?: Pagination) => Promise<ListResponse<T>>;
  getItem: <T>(path: string, id: string) => Promise<T>;
  postItem: <T>(url: string, data: object) => Promise<T>;
  putItem: <T>(path: string, id: string, data: object) => Promise<T>;
  patchItem: <T>(path: string, id: string, data: object) => Promise<T>;
  deleteItem: <T>(path: string, id: string) => Promise<DeleteResponse<T>>;
}

export const apiContext = createContext<ApiData>({} as ApiData);
