import React from 'react';

interface YogshalaLogoIconProps {
  size?: number;
  className?: string;
}

export const YogshalaLogoIcon: React.FC<YogshalaLogoIconProps> = ({ size = 24, className = '' }) => (
  <img 
    src="/images/yogshala-logo.png" 
    alt="YOGSHALA Logo" 
    style={{ width: size, height: size, objectFit: 'cover' }}
    className={`rounded-full ${className}`}
  />
);
