import React from 'react';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { ToastProvider } from '../components/Toast/ToastProvider';

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
};