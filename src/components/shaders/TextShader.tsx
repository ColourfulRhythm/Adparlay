import React, { useEffect, useState, useRef } from 'react';
import { ShaderCanvas } from './ShaderCanvas';

interface TextShaderProps {
  shaderId?: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  triggerWord?: string; // The specific word to apply shader to
}

export const TextShader: React.FC<TextShaderProps> = ({
  shaderId = 4, // Default to Wavy Lines
  className = "",
  style = {},
  children,
  triggerWord = "leads"
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (textRef.current) {
        const rect = textRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        setShouldRender(isInView);
      }
    };

    handleScroll(); // Check on mount
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Split text and apply shader to specific word
  const renderTextWithShader = () => {
    if (typeof children === 'string') {
      const words = children.split(' ');
      return words.map((word, index) => {
        if (word.toLowerCase().includes(triggerWord.toLowerCase())) {
          return (
            <span key={index} className="relative inline-block">
              {word}
              {shouldRender && (
                <div 
                  className="absolute inset-0 z-10 pointer-events-none"
                  style={{
                    maskImage: 'linear-gradient(black, black)',
                    WebkitMaskImage: 'linear-gradient(black, black)',
                    opacity: 0.8
                  }}
                >
                  <ShaderCanvas
                    size={Math.max(word.length * 20, 100)}
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
            </span>
          );
        }
        return word + ' ';
      });
    }
    return children;
  };

  return (
    <div 
      ref={textRef}
      className={`relative ${className}`}
      style={style}
    >
      {renderTextWithShader()}
    </div>
  );
};
