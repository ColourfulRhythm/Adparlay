import React from 'react';
import { ShaderCanvas } from './ShaderCanvas';

interface BackgroundShaderProps {
  shaderId?: number;
  className?: string;
  style?: React.CSSProperties;
  opacity?: number;
}

export const BackgroundShader: React.FC<BackgroundShaderProps> = ({
  shaderId = 1, // Default to Flowing Waves for background
  className = "",
  style = {},
  opacity = 0.3
}) => {
  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ 
        opacity,
        ...style 
      }}
    >
      <ShaderCanvas
        size={Math.max(window.innerWidth, window.innerHeight)}
        shaderId={shaderId}
        hasActiveReminders={false}
        hasUpcomingReminders={false}
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
};
