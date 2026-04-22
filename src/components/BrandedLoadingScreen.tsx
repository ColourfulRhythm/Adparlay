import React from 'react';

interface BrandedLoadingScreenProps {
  message?: string;
  logoSrc?: string;
}

const BrandedLoadingScreen: React.FC<BrandedLoadingScreenProps> = ({
  message = 'Loading...',
  logoSrc = '/logoreal.png'
}) => {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img
          src={logoSrc}
          alt="AdParlay"
          className="h-12 w-auto animate-[pulse_1.6s_ease-in-out_infinite]"
        />
        <p className="text-sm text-[#A3A3A3] animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default BrandedLoadingScreen;
