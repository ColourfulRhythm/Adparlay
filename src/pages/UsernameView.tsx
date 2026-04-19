import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { SocialMediaIcons } from '../components/SocialMediaIcons';
import { AccordionLink } from '../components/AccordionLink';
import { formatUrl } from '../utils/formatUrl';
import { BackgroundShader } from '../components/shaders';
import { Link, User, Camera, ExternalLink } from 'lucide-react';

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

interface ProductItem {
  id: string;
  title: string;
  description: string;
  price?: string;
  image?: string;
  url: string;
  category?: string;
  isVisible: boolean;
  order: number;
  clicks?: number;
}

interface LinkOrganizer {
  id: string;
  userId: string;
  title: string;
  description?: string;
  profileImage?: string;
  profileName?: string;
  bio?: string;
  username?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  backgroundStyle?: {
    type: 'gradient' | 'solid' | 'image';
    primaryColor?: string;
    secondaryColor?: string;
    imageUrl?: string;
  };
  links: LinkItem[];
  products: ProductItem[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UsernameView: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [linkOrganizer, setLinkOrganizer] = useState<LinkOrganizer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'links' | 'shop'>('links');
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  useEffect(() => {
    if (username) {
      fetchLinkOrganizerByUsername();
    }
  }, [username]);

  // Update document head for social sharing
  useEffect(() => {
    if (linkOrganizer) {
      // Update document title
      document.title = `${linkOrganizer.profileName || 'Link Page'} - Adparlay`;
      
      // Update or create meta tags for social sharing
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };
      
      const updateMetaName = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };
      
      // Use profile image or default preview image
      const previewImage = linkOrganizer.profileImage || 'https://adparlaysaas.web.app/logo512.png';
      
      // Open Graph tags
      updateMetaTag('og:title', `${linkOrganizer.profileName || 'Link Page'} - Adparlay`);
      updateMetaTag('og:description', linkOrganizer.bio || 'Check out my links and products');
      updateMetaTag('og:type', 'website');
      updateMetaTag('og:url', window.location.href);
      updateMetaTag('og:site_name', 'Adparlay');
      updateMetaTag('og:image', previewImage);
      
      // Twitter tags
      updateMetaName('twitter:card', 'summary_large_image');
      updateMetaName('twitter:title', `${linkOrganizer.profileName || 'Link Page'} - Adparlay`);
      updateMetaName('twitter:description', linkOrganizer.bio || 'Check out my links and products');
      updateMetaName('twitter:image', previewImage);
      
      // Basic meta description
      updateMetaName('description', linkOrganizer.bio || 'Check out my links and products');
    }
  }, [linkOrganizer]);

  const fetchLinkOrganizerByUsername = async () => {
    if (!username) return;

    console.log('Fetching link organizer for username:', username);

    try {
      // Try to find by username - simplified approach
      const linkOrganizersQuery = query(
        collection(db, 'linkOrganizers'),
        where('username', '==', username)
      );
      
      const querySnapshot = await getDocs(linkOrganizersQuery);
      
      console.log('Query results:', querySnapshot.size, 'documents found');
      
      if (querySnapshot.empty) {
        console.log('No link organizer found for username:', username);
        setError('Link page not found');
        setLoading(false);
        return;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      console.log('Found link organizer data:', data);
      console.log('Document ID:', doc.id);
      
      // Set the link organizer data to render directly
      setLinkOrganizer({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        links: data.links || [],
        products: data.products || []
      } as LinkOrganizer);

    } catch (error) {
      console.error('Error fetching link organizer:', error);
      // If it's a permissions error, try a different approach
      if (error instanceof Error && error.message.includes('permissions')) {
        setError('This link page is private or not available');
      } else {
        setError('Error loading link page');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (link: LinkItem) => {
    try {
      // Update click count
      const linkRef = doc(db, 'linkOrganizers', linkOrganizer!.id);
      await updateDoc(linkRef, {
        [`links.${link.id}.clicks`]: increment(1)
      });

      // Format URL using smart formatting
      const formattedUrl = formatUrl(link.url);

      // Open link in new tab
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error updating click count:', error);
      
      // Format URL using smart formatting
      const formattedUrl = formatUrl(link.url);
      
      // Still open the link even if click tracking fails
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleProductClick = async (product: ProductItem) => {
    try {
      // Update click count
      const linkRef = doc(db, 'linkOrganizers', linkOrganizer!.id);
      await updateDoc(linkRef, {
        [`products.${product.id}.clicks`]: increment(1)
      });

      // Format URL using smart formatting
      const formattedUrl = formatUrl(product.url);

      // Open link in new tab
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error updating click count:', error);
      
      // Format URL using smart formatting
      const formattedUrl = formatUrl(product.url);
      
      // Still open the link even if click tracking fails
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setCurrentX(e.touches[0].clientX);
    const deltaX = currentX - startX;
    
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0 && activeView === 'shop') {
        setSwipeDirection('right');
      } else if (deltaX < 0 && activeView === 'links') {
        setSwipeDirection('left');
      }
    }
  };

  const handleTouchEnd = () => {
    const deltaX = currentX - startX;
    
    if (Math.abs(deltaX) > 100) {
      if (deltaX > 0 && activeView === 'shop') {
        setActiveView('links');
      } else if (deltaX < 0 && activeView === 'links') {
        setActiveView('shop');
      }
    }
    
    setSwipeDirection(null);
    setStartX(0);
    setCurrentX(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !linkOrganizer) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Page Not Found</h1>
          <p className="text-gray-300">{error || 'This link page does not exist or has been removed.'}</p>
        </div>
      </div>
    );
  }

  const visibleLinks = (linkOrganizer.links || []).filter(link => link.isVisible);
  const visibleProducts = (linkOrganizer.products || []).filter(product => product.isVisible);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col items-center p-4 sm:p-8">
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .glass-card {
          background-color: rgba(31, 31, 31, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        `}
      </style>

      <main className="w-full max-w-lg">
        {/* Profile Header with Glass Morphism */}
        <div className="glass-card rounded-[36px] p-6 mb-8 text-center transition-all duration-300">

          {linkOrganizer.profileImage ? (
            <img
              src={linkOrganizer.profileImage}
              alt={`${linkOrganizer.profileName}'s Profile`}
              className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-gray-700 object-cover shadow-xl"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-gray-700 mx-auto mb-4 border-4 border-gray-600 flex items-center justify-center shadow-xl">
              <User size={32} className="text-gray-400" />
            </div>
          )}
          
          <h1 className="text-4xl font-extrabold mb-1 tracking-tight text-white">
            {linkOrganizer.profileName}
          </h1>
          
          <p className="text-gray-400 text-lg font-light max-w-xs mx-auto mb-4">
            {linkOrganizer.bio && linkOrganizer.bio.length > 120 
              ? `${linkOrganizer.bio.substring(0, 120)}...` 
              : linkOrganizer.bio}
          </p>

          {/* Social Links */}
          {linkOrganizer.socialLinks && 
           typeof linkOrganizer.socialLinks === 'object' && 
           Object.values(linkOrganizer.socialLinks).some(link => link) && (
            <div className="mb-4">
              <SocialMediaIcons 
                socialLinks={linkOrganizer.socialLinks}
                size="sm"
                className="opacity-90"
              />
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="glass-card rounded-2xl p-2 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveView('links')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 rounded-xl ${
                activeView === 'links'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Link size={16} />
                <span>Links</span>
                {visibleLinks.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {visibleLinks.length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveView('shop')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 rounded-xl ${
                activeView === 'shop'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Camera size={16} />
                <span>Shop</span>
                {visibleProducts.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {visibleProducts.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">

          <AnimatePresence mode="wait">
            {activeView === 'links' && (
              <motion.div
                key="links"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-6"
              >
                {visibleLinks.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Link className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No links yet</h3>
                    <p className="text-gray-400 text-sm">Links will appear here when added</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleLinks
                      .sort((a, b) => a.order - b.order)
                      .map((link, index) => (
                        <motion.div
                          key={link.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <AccordionLink
                            link={link}
                            theme={linkOrganizer.theme}
                            onClick={handleLinkClick}
                            className="w-full"
                          />
                        </motion.div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeView === 'shop' && (
              <motion.div
                key="shop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-6"
              >
                {visibleProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Camera className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">No products yet</h3>
                    <p className="text-gray-400 text-sm">Products will appear here when added</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {visibleProducts.map((product, index) => (
                      <motion.button
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        className="bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-700 hover:shadow-lg transition-all duration-300 group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Product Image */}
                        <div className="aspect-square relative overflow-hidden">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                              <Camera className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        </div>
                        
                        {/* Product Info */}
                        <div className="p-4">
                          <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 leading-tight">
                            {product.title}
                          </h3>
                          <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                            {product.description}
                          </p>
                          {product.price && (
                            <div className="text-sm font-bold text-green-400 mb-3">
                              {product.price}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-blue-400 font-medium">View Product</span>
                            <ExternalLink className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform duration-200" />
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </main>
    </div>
  );
};

export default UsernameView;
