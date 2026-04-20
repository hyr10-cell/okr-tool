import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  const baseClasses = 'rounded-lg border border-gray-200 bg-white p-5';
  const hoverClasses = hoverable || onClick ? 'hover:shadow-md transition cursor-pointer' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
