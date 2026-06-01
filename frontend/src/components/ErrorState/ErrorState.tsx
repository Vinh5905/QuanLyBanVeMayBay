import React from 'react';
import './ErrorState.css';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Something went wrong', 
  message, 
  onRetry 
}) => {
  return (
    <div className="ds-error-state">
      <div className="ds-error-state__icon">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="ds-error-state__title">{title}</h3>
      <p className="ds-error-state__message">{message}</p>
      {onRetry && (
        <button className="ds-error-state__retry" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};
