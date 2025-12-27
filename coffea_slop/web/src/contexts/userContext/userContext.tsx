'use client';

import { createContext } from 'react';
import { UserEntity } from '@/model/user.entity';

interface UserContextType {
  user: UserEntity | null;
  setUser: (user: UserEntity | null) => void;
  isAuthenticated: boolean;
}

export const userContext = createContext<UserContextType | null>(null);