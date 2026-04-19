import React from 'react';
import { ShaderCanvas } from './ShaderCanvas';

interface FeatureBoxShaderProps {
  shaderId?: number;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
}

export const FeatureBoxShader: React.FC<FeatureBoxShaderProps> = ({
  shaderId = 4, // Default to Wavy Lines for feature boxes
  className = "",
  style = {},
  size = 150,
  position = 'center'
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return { top: '-75px', left: '-75px' };
      case 'top-right':
        return { top: '-75px', right: '-75px' };
      case 'bottom-left':
        return { bottom: '-75px', left: '-75px' };
      case 'bottom-right':
        return { bottom: '-75px', right: '-75px' };
      case 'center':
      default:
        return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
  };

  return (
    <div 
      className={`absolute pointer-events-none ${className}`}
      style={{ 
        ...getPositionStyles(),
        ...style 
      }}
    >
      <ShaderCanvas
        size={size}
        shaderId={shaderId}
        hasActiveReminders={false}
        hasUpcomingReminders={false}
        className="rounded-full opacity-20"
      />
    </div>
  );
};
