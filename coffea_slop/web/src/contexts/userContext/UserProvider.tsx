'use client';

import { useState, ReactNode } from 'react';
import { UserEntity } from '@/model/user.entity';
import { userContext } from './userContext';

export function UserProvider(
  {
    children,
  }: {
    children: ReactNode;
  },
) {
  const [user, setUser] = useState<UserEntity | null>(null);

  const value = {
    user,
    setUser,
    isAuthenticated: user !== null,
  };

  return (
    <userContext.Provider value={value}>
      {children}
    </userContext.Provider>
  );
}