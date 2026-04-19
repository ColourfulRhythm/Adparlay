import React, { useEffect, useState, useRef } from 'react';
import { ShaderCanvas } from './ShaderCanvas';

interface IconShaderProps {
  shaderId?: number;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  isHovered?: boolean;
  isInView?: boolean;
  children: React.ReactNode;
}

export const IconShader: React.FC<IconShaderProps> = ({
  shaderId = 4, // Default to Wavy Lines
  className = "",
  style = {},
  size = 64,
  isHovered = false,
  isInView = false,
  children
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShouldRender(isHovered || isInView);
  }, [isHovered, isInView]);

  return (
    <div 
      ref={iconRef}
      className={`relative ${className}`}
      style={style}
    >
      {/* Original icon */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Shader overlay that appears on hover/scroll */}
      {shouldRender && (
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            maskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle, black 0%, transparent 70%)',
            opacity: isHovered ? 0.8 : 0.4,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          <ShaderCanvas
            size={size}
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
      )}
    </div>
  );
};
