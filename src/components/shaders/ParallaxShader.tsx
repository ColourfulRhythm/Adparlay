import React, { useEffect, useState } from 'react';
import { ShaderCanvas } from './ShaderCanvas';

interface ParallaxShaderProps {
  shaderId?: number;
  className?: string;
  style?: React.CSSProperties;
  size?: number;
  intensity?: number; // Parallax intensity (0-1)
}

export const ParallaxShader: React.FC<ParallaxShaderProps> = ({
  shaderId = 3, // Default to Shooting Stars for parallax
  className = "",
  style = {},
  size = 200,
  intensity = 0.5
}) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const parallaxOffset = scrollY * intensity;

  return (
    <div 
      className={`absolute pointer-events-none ${className}`}
      style={{ 
        transform: `translateY(${parallaxOffset}px)`,
        ...style 
      }}
    >
      <ShaderCanvas
        size={size}
        shaderId={shaderId}
        hasActiveReminders={false}
        hasUpcomingReminders={false}
        className="rounded-full"
      />
    </div>
  );
};
