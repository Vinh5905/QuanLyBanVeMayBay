import React from 'react';
import { AuthProvider } from '../features/auth/context/AuthContext';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};