import React from 'react';
import './LoadingState.css';

export const LoadingState: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="ds-loading-state">
      <div className="ds-spinner">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="ds-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="ds-spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      {text && <p className="ds-loading-text">{text}</p>}
    </div>
  );
};

export const Skeleton: React.FC<{ width?: string | number, height?: string | number, className?: string }> = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div className={`ds-skeleton ${className}`} style={{ width, height }}></div>
  );
};
