import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatUrl } from '../utils/formatUrl';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  color?: string;
  type: 'link' | 'social' | 'product' | 'poll' | 'quiz' | 'form' | 'embed';
  isVisible: boolean;
  order: number;
  clicks?: number;
}

interface AccordionLinkProps {
  link: LinkItem;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  onClick?: (link: LinkItem) => void;
  className?: string;
}

export const AccordionLink: React.FC<AccordionLinkProps> = ({ 
  link, 
  theme, 
  onClick,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('AccordionLink clicked:', link.title, 'URL:', link.url);
    
    if (onClick) {
      onClick(link);
    } else {
      // Format URL using smart formatting
      const formattedUrl = formatUrl(link.url);
      
      console.log('Opening URL:', formattedUrl);
      
      // Default behavior - open link in new tab
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    }
    // Track click if needed
    if (link.clicks !== undefined) {
      // This would typically update the click count in the database
      console.log(`Link ${link.title} clicked`);
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Link Button - Clean White Design */}
      <motion.div
        onClick={handleLinkClick}
        className="block w-full relative overflow-hidden cursor-pointer group bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-md transition-all duration-200"
        whileHover={{ 
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLinkClick(e as any);
          }
        }}
      >
        {/* Content */}
        <div className="relative p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Icon/Image */}
              <div className="flex-shrink-0">
                {link.icon ? (
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100">
                    {link.icon.startsWith('http') ? (
                      <img 
                        src={link.icon} 
                        alt={link.title}
                        className="w-6 h-6 object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-gray-600 text-lg">
                        {link.icon}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gray-50 border border-gray-100">
                    <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 
                  className="text-gray-900 font-semibold text-base tracking-wide truncate"
                  style={{ fontFamily: theme.fontFamily }}
                >
                  {link.title}
                </h3>
                {link.type !== 'link' && (
                  <p className="text-gray-500 text-sm capitalize mt-1">
                    {link.type}
                  </p>
                )}
              </div>
            </div>
            
            {/* Expand/Collapse Button */}
            {link.description && (
              <button
                onClick={handleToggle}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors ml-3 p-1"
              >
                <motion.svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Collapsible Description */}
      <AnimatePresence>
        {isExpanded && link.description && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div 
              className="mt-3 p-4 rounded-2xl text-sm text-gray-600 bg-gray-50 border border-gray-100"
              style={{ fontFamily: theme.fontFamily }}
            >
              {link.description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
