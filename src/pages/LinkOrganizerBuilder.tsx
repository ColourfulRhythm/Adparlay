import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useSEO } from '../hooks/useSEO';
import { getBaseUrl } from '../utils/getBaseUrl';
import { SocialMediaIcons } from '../components/SocialMediaIcons';
import { Link, User, Pencil, Save, Plus, X, Trash2, ArrowUp, ArrowDown, Camera, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: 'Link' | 'User' | 'Camera';
  customIcon?: string;
  iconType?: 'default' | 'custom';
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
  id?: string;
  userId: string;
  title: string;
  description?: string;
  profileImage?: string;
  profileName?: string;
  bio?: string;
  username?: string;
  isPublic?: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };
  backgroundStyle?: {
    type: 'solid' | 'gradient';
    primaryColor: string;
    secondaryColor?: string;
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

// --- LINK MODULE (The Core UI Element) ---
const LinkModule = ({ link, isEditing, onDelete, onEditClick, onReorder }: {
  link: LinkItem;
  isEditing: boolean;
  onDelete: (id: string) => void;
  onEditClick: (link: LinkItem) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
}) => {
  // Dynamically select icon based on the string name or custom icon
  const iconMap = { Link, User, Camera: Pencil };
  const IconComponent = link.icon ? iconMap[link.icon] || Link : Link;

  const moduleClasses = isEditing
    ? 'opacity-80 border-2 border-dashed border-gray-600 hover:border-gray-500'
    : 'hover:scale-[1.01] transition-transform shadow-xl hover:shadow-2xl';

  const handleNavigation = (e: React.MouseEvent) => {
    if (!isEditing && link.url) {
      e.preventDefault();
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`
      w-full p-4 rounded-3xl bg-gray-900 transition-all duration-300
      flex items-center justify-between text-gray-100 ${moduleClasses}
      mb-4 cursor-pointer
    `} style={{ borderColor: isEditing ? link.color : 'transparent' }}>
      <a
        href={link.url || '#'}
        onClick={handleNavigation}
        className="flex-grow flex items-center min-w-0"
        aria-label={`Go to ${link.title}`}
      >
        {/* Icon Circle */}
        <div
          className="p-3 mr-4 rounded-full flex items-center justify-center transition-colors duration-300 shadow-lg flex-shrink-0"
          style={{ backgroundColor: link.color || '#70d6ff' }}
        >
          {link.customIcon && link.iconType === 'custom' ? (
            <img 
              src={link.customIcon} 
              alt={link.title} 
              className="w-5 h-5 object-cover"
            />
          ) : (
          <IconComponent size={20} className="text-white" />
          )}
        </div>
        {/* Link Title */}
        <span className="text-xl font-medium truncate">
          {link.title}
        </span>
      </a>

      {/* Editing Controls */}
      {isEditing && (
        <div className="flex space-x-2 flex-shrink-0">
          <button
            onClick={() => onEditClick(link)}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            aria-label="Edit link"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onReorder(link.id, 'up')}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            aria-label="Move link up"
          >
            <ArrowUp size={18} />
          </button>
          <button
            onClick={() => onReorder(link.id, 'down')}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            aria-label="Move link down"
          >
            <ArrowDown size={18} />
          </button>
          <button
            onClick={() => onDelete(link.id)}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
            aria-label="Delete link"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- IMAGE UTILITIES ---
const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and resize
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to base64
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// --- LINK EDITOR MODAL ---
const LinkEditor = ({ currentLink, onClose, onSave }: {
  currentLink: LinkItem | null;
  onClose: () => void;
  onSave: (linkData: LinkItem) => void;
}) => {
  const [title, setTitle] = useState(currentLink?.title || '');
  const [url, setUrl] = useState(currentLink?.url || '');
  const [color, setColor] = useState(currentLink?.color || '#70d6ff');
  const [description, setDescription] = useState(currentLink?.description || '');
  const [price, setPrice] = useState((currentLink as any)?.price || '');
  const [image, setImage] = useState((currentLink as any)?.image || '');
  const [customIcon, setCustomIcon] = useState((currentLink as any)?.customIcon || '');
  const [iconType, setIconType] = useState<'default' | 'custom'>((currentLink as any)?.customIcon ? 'custom' : 'default');

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedImage = await resizeImage(file, 64, 64); // Icon size
        setCustomIcon(resizedImage);
        setIconType('custom');
      } catch (error) {
        console.error('Error uploading icon:', error);
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedImage = await resizeImage(file, 400, 400); // Product image size
        setImage(resizedImage);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentLink) {
      const linkData = {
        ...currentLink,
        title,
        url,
        color,
        description,
        customIcon: iconType === 'custom' ? customIcon : '',
        iconType
      };
      
      // Add product-specific fields if it's a product
      if (currentLink.type === 'product') {
        (linkData as any).price = price;
        (linkData as any).image = image;
      }
      
      onSave(linkData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 p-6 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-100">
            {currentLink?.type === 'product' 
              ? (currentLink?.id ? 'Edit Product' : 'Add New Product')
              : (currentLink?.id ? 'Edit Link' : 'Add New Link')
            }
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close editor">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="link-title">
              {currentLink?.type === 'product' ? 'Product Title' : 'Title'}
            </label>
            <input
              id="link-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="link-description">Description</label>
            <textarea
              id="link-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Icon</label>
            <div className="space-y-3">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setIconType('default')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    iconType === 'default' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Default Icons
                </button>
                <button
                  type="button"
                  onClick={() => setIconType('custom')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    iconType === 'custom' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Upload Icon
                </button>
              </div>
              
              {iconType === 'default' ? (
                <div className="grid grid-cols-3 gap-2">
                  {['Link', 'User', 'Camera'].map((iconName) => {
                    const iconMap: { [key: string]: any } = { Link, User, Camera: Pencil };
                    const IconComponent = iconMap[iconName];
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => {
                          setIconType('default');
                          // Update the icon in the current link object
                          if (currentLink) {
                            currentLink.icon = iconName as 'Link' | 'User' | 'Camera';
                            currentLink.customIcon = '';
                            currentLink.iconType = 'default';
                          }
                        }}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          currentLink?.icon === iconName
                            ? 'border-blue-500 bg-blue-500/20'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <IconComponent size={20} className="text-white mx-auto" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                    id="icon-upload"
                  />
                  <label
                    htmlFor="icon-upload"
                    className="block w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-gray-500 transition-colors"
                  >
                    {customIcon ? (
                      <div className="space-y-2">
                        <img src={customIcon} alt="Custom icon" className="w-12 h-12 mx-auto rounded-lg object-cover" />
                        <p className="text-sm text-gray-300">Click to change icon</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Camera size={24} className="text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-300">Upload custom icon</p>
                        <p className="text-xs text-gray-500">Max 64x64px, will be auto-resized</p>
                      </div>
                    )}
                  </label>
                </div>
              )}
            </div>
          </div>

          {currentLink?.type === 'product' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="product-price">Price</label>
                <input
                  id="product-price"
                  type="text"
                  placeholder="e.g., $29.99"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Product Image</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="product-image-upload"
                  />
                  <label
                    htmlFor="product-image-upload"
                    className="block w-full p-6 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-gray-500 transition-colors"
                  >
                    {image ? (
                      <div className="space-y-3">
                        <img src={image} alt="Product" className="w-24 h-24 mx-auto rounded-lg object-cover" />
                        <p className="text-sm text-gray-300">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Camera size={32} className="text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-300">Upload product image</p>
                        <p className="text-xs text-gray-500">Max 400x400px, will be auto-resized</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="link-url">
              {currentLink?.type === 'product' ? 'Product URL' : 'URL'}
            </label>
            <input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1" htmlFor="link-color">Accent Color</label>
            <input
              id="link-color"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full h-10 p-1 rounded-xl bg-gray-800 border border-gray-700"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-3 mt-4 rounded-xl text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Save size={20} className="inline-block mr-2" />
            {currentLink?.type === 'product' ? 'Save Product' : 'Save Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

const LinkOrganizerBuilder: React.FC = () => {
  const { currentUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // SEO optimization
  useSEO({
    title: 'Link Organizer Builder - Adparlay | Create Beautiful Link Pages',
    description: 'Build stunning link organizer pages with Adparlay. Create mobile-first link pages with shop integration, engagement widgets, and AI-powered design.',
    keywords: 'link organizer, linktree alternative, bio link, social media links, mobile-first design',
    canonical: 'https://adparlaysaas.web.app/link-organizer-builder'
  });

  const [linkOrganizer, setLinkOrganizer] = useState<LinkOrganizer>({
    userId: currentUser?.id || '',
    title: 'My Link Page',
    description: 'Welcome to my link page',
    profileName: currentUser?.displayName || 'Your Name',
    bio: 'Add a short bio here...',
    username: currentUser?.email?.split('@')[0] || 'username',
    isPublic: true,
    socialLinks: {},
    backgroundStyle: {
      type: 'gradient',
      primaryColor: '#1F2937',
      secondaryColor: '#374151'
    },
    links: [],
    products: [],
    theme: {
      primaryColor: '#1F2937',
      secondaryColor: '#374151',
      accentColor: '#8B5CF6',
      fontFamily: 'Inter'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const [activeTab, setActiveTab] = useState<'links' | 'shop'>('links');
  const [isEditing, setIsEditing] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- CRUD OPERATIONS FOR "EDITOR IS PREVIEW" APPROACH ---
  
  const handleSaveLink = async (linkData: LinkItem & { isNew?: boolean }) => {
    if (!linkOrganizer.id || !currentUser?.id) return;
    
    try {
      setSaving(true);
      
      if (linkData.type === 'product') {
        // Handle products
        let newProducts: ProductItem[];
        if (linkData.isNew) {
          // Add new product
          const newId = Date.now().toString();
          newProducts = [...linkOrganizer.products, { 
            ...linkData, 
            id: newId,
            title: linkData.title,
            description: linkData.description || '',
            price: (linkData as any).price || '',
            image: (linkData as any).image || '',
            url: linkData.url,
            category: '',
            isVisible: true,
            order: linkOrganizer.products.length,
            clicks: 0
          } as ProductItem];
        } else {
          // Update existing product
          newProducts = linkOrganizer.products.map(p => 
            p.id === linkData.id 
              ? { 
                  ...p, 
                  title: linkData.title,
                  description: linkData.description || '',
                  price: (linkData as any).price || '',
                  image: (linkData as any).image || '',
                  url: linkData.url
                } 
              : p
          );
        }

        const updatedLinkOrganizer = {
          ...linkOrganizer,
          products: newProducts,
          updatedAt: new Date()
        };

        setLinkOrganizer(updatedLinkOrganizer);
        
        // Save to database immediately
        await updateDoc(doc(db, 'linkOrganizers', linkOrganizer.id), updatedLinkOrganizer);
        
        toast.success('Product saved successfully!');
      } else {
        // Handle regular links
    let newLinks: LinkItem[];
    if (linkData.isNew) {
      // Add new link
      const newId = Date.now().toString();
      newLinks = [...linkOrganizer.links, { ...linkData, id: newId, icon: linkData.icon || 'Link' }];
    } else {
      // Update existing link
      newLinks = linkOrganizer.links.map(l => l.id === linkData.id ? linkData : l);
    }

        const updatedLinkOrganizer = {
          ...linkOrganizer,
      links: newLinks,
      updatedAt: new Date()
        };

        setLinkOrganizer(updatedLinkOrganizer);
        
        // Save to database immediately
        await updateDoc(doc(db, 'linkOrganizers', linkOrganizer.id), updatedLinkOrganizer);
        
    toast.success('Link saved successfully!');
      }
      
      setEditingLink(null);
    } catch (error) {
      console.error('Error saving link:', error);
      toast.error('Failed to save link. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLink = async (idToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    if (!linkOrganizer.id || !currentUser?.id) return;

    try {
      setSaving(true);

    const updatedLinks = linkOrganizer.links.filter(l => l.id !== idToDelete);
    
      const updatedLinkOrganizer = {
        ...linkOrganizer,
      links: updatedLinks,
      updatedAt: new Date()
      };
      
      setLinkOrganizer(updatedLinkOrganizer);
      
      // Save to database immediately
      await updateDoc(doc(db, 'linkOrganizers', linkOrganizer.id), updatedLinkOrganizer);
    
    toast.success('Link deleted successfully!');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('Failed to delete link. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    const index = linkOrganizer.links.findIndex(l => l.id === id);
    if (index === -1) return;
    if (!linkOrganizer.id || !currentUser?.id) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= linkOrganizer.links.length) return;

    try {
      setSaving(true);

    const newLinks = [...linkOrganizer.links];
    [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];

      const updatedLinkOrganizer = {
        ...linkOrganizer,
      links: newLinks,
      updatedAt: new Date()
      };

      setLinkOrganizer(updatedLinkOrganizer);
      
      // Save to database immediately
      await updateDoc(doc(db, 'linkOrganizers', linkOrganizer.id), updatedLinkOrganizer);
    } catch (error) {
      console.error('Error reordering links:', error);
      toast.error('Failed to reorder links. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = () => {
    setEditingLink({
      id: '',
      title: 'New Link',
      url: 'https://example.com',
      icon: 'Link',
      color: '#70d6ff',
      type: 'link',
      isVisible: true,
      order: linkOrganizer.links.length,
      isNew: true
    } as LinkItem & { isNew: boolean });
  };

  const handleFieldEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleFieldSave = async (field: string) => {
    if (!linkOrganizer.id || !currentUser?.id) return;
    
    try {
      setSaving(true);
      
      const updatedLinkOrganizer = {
        ...linkOrganizer,
      [field]: tempValue,
      updatedAt: new Date()
      };
      
      setLinkOrganizer(updatedLinkOrganizer);
      
      // Save to database immediately
      await updateDoc(doc(db, 'linkOrganizers', linkOrganizer.id), updatedLinkOrganizer);
      
    setEditingField(null);
    setTempValue('');
    toast.success('Updated successfully!');
    } catch (error) {
      console.error('Error saving field:', error);
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!currentUser?.id) return;
    
    setSaving(true);
    try {
      if (linkOrganizer.id) {
        // Update existing
        await updateDoc(doc(db, 'linkOrganizers', linkOrganizer.id), {
          ...linkOrganizer,
          updatedAt: new Date()
        });
        toast.success('Link organizer updated successfully!');
      } else {
        // Create new
        const docRef = await addDoc(collection(db, 'linkOrganizers'), {
          ...linkOrganizer,
          userId: currentUser.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setLinkOrganizer(prev => ({ ...prev, id: docRef.id }));
        toast.success('Link organizer created successfully!');
      }
    } catch (error) {
      console.error('Error saving link organizer:', error);
      toast.error('Failed to save link organizer');
    } finally {
      setSaving(false);
    }
  };

  // Load existing link organizer if editing
  useEffect(() => {
    if (id && currentUser) {
      const fetchLinkOrganizer = async () => {
        setLoading(true);
        try {
          const docRef = doc(db, 'linkOrganizers', id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setLinkOrganizer({
              userId: data.userId || currentUser?.id || '',
              title: data.title || 'My Link Page',
              description: data.description || 'Welcome to my link page',
              profileName: data.profileName || 'Your Name',
              bio: data.bio || 'Add a short bio here...',
              username: data.username || 'username',
              isPublic: data.isPublic ?? true,
              socialLinks: data.socialLinks || {},
              backgroundStyle: data.backgroundStyle || {
                type: 'gradient',
                primaryColor: '#1F2937',
                secondaryColor: '#374151'
              },
              links: data.links || [],
              products: data.products || [],
              theme: data.theme || {
                primaryColor: '#1F2937',
                secondaryColor: '#374151',
                accentColor: '#8B5CF6',
                fontFamily: 'Inter'
              },
              id: docSnap.id,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            });
          } else {
            toast.error('Link organizer not found');
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching link organizer:', error);
          toast.error('Failed to load link organizer');
        } finally {
          setLoading(false);
        }
      };

      fetchLinkOrganizer();
    }
  }, [id, currentUser, navigate]);

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

      {/* Header with controls */}
      <div className="w-full max-w-lg mb-6">
        <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">Link Organizer Builder</h1>
              <p className="text-xs text-gray-400">Create beautiful link pages</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                isEditing 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {isEditing ? 'Exit Edit' : 'Edit Mode'}
            </button>
            {linkOrganizer.id && (
              <button
                onClick={() => {
                  const linkUrl = linkOrganizer.username 
                    ? `${getBaseUrl()}/${linkOrganizer.username}`
                    : `${getBaseUrl()}/link/${linkOrganizer.id}`;
                  navigator.clipboard.writeText(linkUrl);
                  toast.success('Link copied to clipboard!');
                }}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Copy Link
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      <main className="w-full max-w-lg">
        {/* Profile Header with Glass Morphism */}
        <div className="glass-card rounded-[36px] p-6 mb-8 text-center transition-all duration-300">
          {linkOrganizer.profileImage ? (
            <div className="relative group">
            <img
              src={linkOrganizer.profileImage}
              alt={`${linkOrganizer.profileName}'s Profile`}
              className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-gray-700 object-cover shadow-xl"
            />
              {isEditing && (
                <button
                  onClick={() => document.getElementById('profile-image-upload')?.click()}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Camera size={16} className="text-white" />
                </button>
              )}
            </div>
          ) : (
            <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-gray-700 mx-auto mb-4 border-4 border-gray-600 flex items-center justify-center shadow-xl">
              <User size={32} className="text-gray-400" />
              </div>
              {isEditing && (
                <button
                  onClick={() => document.getElementById('profile-image-upload')?.click()}
                  className="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Camera size={16} className="text-white" />
                </button>
              )}
            </div>
          )}
          
          {/* Hidden file input for profile image */}
          <input
            id="profile-image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  setLinkOrganizer(prev => ({
                    ...prev,
                    profileImage: event.target?.result as string,
                    updatedAt: new Date()
                  }));
                  toast.success('Profile image updated!');
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
          />
          
          {/* Editable Profile Name */}
          {editingField === 'profileName' ? (
            <div className="mb-4">
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() => handleFieldSave('profileName')}
                onKeyPress={(e) => e.key === 'Enter' && handleFieldSave('profileName')}
                className="text-4xl font-extrabold mb-1 tracking-tight text-white bg-transparent border-none outline-none text-center w-full"
                autoFocus
              />
            </div>
          ) : (
            <h1 
              className="text-4xl font-extrabold mb-1 tracking-tight text-white cursor-pointer hover:bg-gray-800 rounded-lg p-2 transition-colors"
              onClick={() => handleFieldEdit('profileName', linkOrganizer.profileName || '')}
            >
              {linkOrganizer.profileName}
            </h1>
          )}
          
          {/* Editable Bio */}
          {editingField === 'bio' ? (
            <div className="mb-4">
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() => handleFieldSave('bio')}
                onKeyPress={(e) => e.key === 'Enter' && handleFieldSave('bio')}
                className="text-gray-400 text-lg font-light max-w-xs mx-auto bg-transparent border-none outline-none text-center w-full resize-none"
                rows={3}
                maxLength={98}
                autoFocus
              />
              <div className="text-xs text-gray-500 mt-1 text-center">
                {tempValue.length}/98 characters
              </div>
            </div>
          ) : (
            <p 
              className="text-gray-400 text-lg font-light max-w-xs mx-auto mb-4 cursor-pointer hover:bg-gray-800 rounded-lg p-2 transition-colors"
              onClick={() => handleFieldEdit('bio', linkOrganizer.bio || '')}
            >
              {linkOrganizer.bio}
            </p>
          )}

          {/* Social Links */}
          <div className="mb-4">
          {linkOrganizer.socialLinks && 
           typeof linkOrganizer.socialLinks === 'object' && 
           Object.values(linkOrganizer.socialLinks).some(link => link) && (
              <div className="mb-2">
              <SocialMediaIcons 
                socialLinks={linkOrganizer.socialLinks}
                size="sm"
                className="opacity-90"
              />
            </div>
          )}
            
            {isEditing && (
              <button
                onClick={() => setEditingField(editingField === 'socialLinks' ? null : 'socialLinks')}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                {editingField === 'socialLinks' ? 'Done' : 'Edit Social Links'}
              </button>
            )}
            
            {editingField === 'socialLinks' && (
              <div className="mt-3 space-y-3 p-4 bg-gray-800 rounded-lg">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Instagram</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/username"
                    value={linkOrganizer.socialLinks?.instagram || ''}
                    onChange={(e) => {
                      setLinkOrganizer(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          instagram: e.target.value
                        },
                        updatedAt: new Date()
                      }));
                    }}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Twitter</label>
                  <input
                    type="url"
                    placeholder="https://twitter.com/username"
                    value={linkOrganizer.socialLinks?.twitter || ''}
                    onChange={(e) => {
                      setLinkOrganizer(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          twitter: e.target.value
                        },
                        updatedAt: new Date()
                      }));
                    }}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkOrganizer.socialLinks?.linkedin || ''}
                    onChange={(e) => {
                      setLinkOrganizer(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          linkedin: e.target.value
                        },
                        updatedAt: new Date()
                      }));
                    }}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">YouTube</label>
                  <input
                    type="url"
                    placeholder="https://youtube.com/@username"
                    value={linkOrganizer.socialLinks?.youtube || ''}
                    onChange={(e) => {
                      setLinkOrganizer(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          youtube: e.target.value
                        },
                        updatedAt: new Date()
                      }));
                    }}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">TikTok</label>
                  <input
                    type="url"
                    placeholder="https://tiktok.com/@username"
                    value={linkOrganizer.socialLinks?.tiktok || ''}
                    onChange={(e) => {
                      setLinkOrganizer(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          tiktok: e.target.value
                        },
                        updatedAt: new Date()
                      }));
                    }}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card rounded-2xl p-2 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('links')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 rounded-xl ${
                activeTab === 'links'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Link size={16} />
                <span>Links</span>
                {linkOrganizer.links.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {linkOrganizer.links.length}
                  </span>
                )}
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 rounded-xl ${
                activeTab === 'shop'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Camera size={16} />
                <span>Shop</span>
                {linkOrganizer.products.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {linkOrganizer.products.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'links' && (
            <div className="space-y-4">
              {linkOrganizer.links.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Link size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No links yet</h3>
                  <p className="text-gray-400 text-sm">Click Edit Mode to start adding links</p>
                </div>
              ) : (
                linkOrganizer.links.map(link => (
                  <LinkModule
                    key={link.id}
                    link={link}
                    isEditing={isEditing}
                    onDelete={handleDeleteLink}
                    onEditClick={setEditingLink}
                    onReorder={handleReorder}
                  />
                ))
              )}

              {isEditing && (
                <button
                  onClick={handleAddLink}
                  className="w-full py-4 rounded-3xl bg-gray-800 text-blue-400 hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 font-semibold text-lg border-2 border-dashed border-gray-600"
                >
                  <Plus size={24} />
                  <span>Add New Link Module</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'shop' && (
            <div className="space-y-4">
              {linkOrganizer.products.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No products yet</h3>
                  <p className="text-gray-400 text-sm mb-4">Add products to showcase in your shop</p>
                  {isEditing && (
                    <button
                      onClick={() => setEditingLink({ id: '', title: '', description: '', price: '', image: '', url: '', category: '', isVisible: true, order: 0, type: 'product', isNew: true } as LinkItem & { isNew: boolean })}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Product
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {linkOrganizer.products.map((product, index) => (
                    <div
                      key={product.id}
                      className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 group ${
                        isEditing ? 'opacity-80 border-2 border-dashed border-gray-600 hover:border-gray-500' : 'hover:scale-105'
                      }`}
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
                            <Camera size={24} className="text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                        
                        {/* Edit overlay for editing mode */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingLink({
                                ...product,
                                type: 'product' as const,
                                icon: 'Link' as const,
                                color: '#70d6ff'
                              })}
                              className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                            >
                              <Pencil size={16} className="text-white" />
                            </button>
                          </div>
                        )}
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
                          <ExternalLink size={16} className="text-blue-400 group-hover:translate-x-1 transition-transform duration-200" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isEditing && linkOrganizer.products.length > 0 && (
                <button
                  onClick={() => setEditingLink({ id: '', title: '', description: '', price: '', image: '', url: '', category: '', isVisible: true, order: linkOrganizer.products.length, type: 'product', isNew: true } as LinkItem & { isNew: boolean })}
                  className="w-full py-4 rounded-3xl bg-gray-800 text-blue-400 hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 font-semibold text-lg border-2 border-dashed border-gray-600"
                >
                  <Plus size={24} />
                  <span>Add New Product</span>
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Floating Edit Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`
            p-4 rounded-full text-white shadow-2xl transition-all duration-300
            ${isEditing ? 'bg-red-600 hover:bg-red-700 rotate-90' : 'bg-blue-600 hover:bg-blue-700'}
          `}
          aria-label={isEditing ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
          {isEditing ? <X size={24} /> : <Pencil size={24} />}
        </button>
      </div>

      {/* Link Editor Modal */}
      {editingLink && (
        <LinkEditor
          currentLink={editingLink}
          onClose={() => setEditingLink(null)}
          onSave={handleSaveLink}
        />
      )}
    </div>
  );
};

export default LinkOrganizerBuilder;