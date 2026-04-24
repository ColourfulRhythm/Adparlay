import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import PaystackPayment from '../components/PaystackPayment';
import AIBuilder from '../components/AIBuilder';
import ExportModal from '../components/ExportModal';
import BrandedLoadingScreen from '../components/BrandedLoadingScreen';

import { useSEO } from '../hooks/useSEO';
import AnimatedDropdown from '../components/ui/AnimatedDropdown';
import { FileText, LayoutTemplate, Link as LinkIcon, MoreVertical, Eye, Trash2 } from 'lucide-react';

interface Form {
  id: string;
  title: string;
  description?: string;
  fields: any[];
  settings: any;
  status: string;
  createdAt: Date;
  lastSubmission?: Date;
  submissions: number;
}

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // SEO optimization
  useSEO({
    title: 'Dashboard - Adparlay | Build Forms That Tell Your Story',
    description: 'Manage your forms and landing pages with Adparlay dashboard. Track submissions, view analytics, and create beautiful lead capture forms.',
    keywords: 'form dashboard, lead capture analytics, form management, submission tracking',
    canonical: 'https://adparlaysaas.web.app/dashboard'
  });
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  const [stats, setStats] = useState({
    totalForms: 0,
    totalSubmissions: 0,
    conversionRate: 0,
    thisMonthSubmissions: 0
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAIBuilderModal, setShowAIBuilderModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [deletingForms, setDeletingForms] = useState<Set<string>>(new Set());
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [deletingLandingPages, setDeletingLandingPages] = useState<Set<string>>(new Set());
  const [linkOrganizers, setLinkOrganizers] = useState<any[]>([]);
  const [deletingLinkOrganizers, setDeletingLinkOrganizers] = useState<Set<string>>(new Set());
  
  // Loading states for better UX
  const [loadingForms, setLoadingForms] = useState(false);
  const [loadingLandingPages, setLoadingLandingPages] = useState(false);
  const [loadingLinkOrganizers, setLoadingLinkOrganizers] = useState(false);
  const hasLoadedInitialData = useRef(false);

  useEffect(() => {
    if (currentUser) {
      if (hasLoadedInitialData.current) {
        return;
      }
      hasLoadedInitialData.current = true;
      // Load forms first (most important), then others in background
      fetchForms();
      
      // Load other data with a slight delay to improve perceived performance
      setTimeout(() => {
        fetchLandingPages();
        fetchLinkOrganizers();
      }, 100);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!loading) return;
    const timeout = window.setTimeout(() => {
      setLoading(false);
    }, 10000);
    return () => window.clearTimeout(timeout);
  }, [loading]);

  // Refresh forms when user changes - removed automatic refresh to prevent infinite loops

  // Manual refresh function
  const handleRefresh = () => {
    if (currentUser) {
      fetchForms();
      fetchLandingPages();
      fetchLinkOrganizers();
      // Force analytics refresh by updating a state that triggers useEffect
      setStats(prev => ({ ...prev }));
    }
  };

  const deleteForm = async (formId: string) => {
    if (!currentUser?.id) {
      alert('You must be logged in to delete forms.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this form? This action cannot be undone and will also delete all submissions associated with this form.');
    
    if (!confirmDelete) {
      return;
    }

    try {
      // Set loading state immediately for better UX
      setDeletingForms(prev => new Set(prev).add(formId));
      
      // Optimistically remove the form from UI for immediate feedback
      setForms(prev => prev.filter(form => form.id !== formId));
      
      // Delete form and submissions in parallel for better performance
      const formDeletePromise = deleteDoc(doc(db, 'forms', formId));
      
      // Get submissions count first to avoid unnecessary query if none exist
      const submissionsQuery = query(
        collection(db, 'formSubmissions'),
        where('formId', '==', formId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      let submissionsDeletePromise: Promise<any> = Promise.resolve();
      if (submissionsSnapshot.size > 0) {
        // Delete all submissions in parallel
        const deletePromises = submissionsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        submissionsDeletePromise = Promise.all(deletePromises);
      }
      
      // Wait for both operations to complete
      await Promise.all([formDeletePromise, submissionsDeletePromise]);
      
      console.log('Form and submissions deleted successfully');
      
      // Update stats immediately without full refresh
      setStats(prev => ({
        ...prev,
        totalForms: prev.totalForms - 1
      }));
      
      // Show success message
      alert('Form deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting form:', error);
      
      // Restore the form in UI if deletion failed
      fetchForms();
      
      alert(`Error deleting form: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      // Clear loading state
      setDeletingForms(prev => {
        const newSet = new Set(prev);
        newSet.delete(formId);
        return newSet;
      });
    }
  };

  const fetchForms = async () => {
    if (!currentUser?.id) {
      console.log('fetchForms: No currentUser.id available');
      return;
    }
    
    setLoadingForms(true);
    try {
      // Keep query index-light: filter by user only, sort client-side.
      const formsQuery = query(collection(db, 'forms'), where('userId', '==', currentUser.id));
      const querySnapshot = await getDocs(formsQuery);
      const formsList: Form[] = [];
      let totalSubmissions = 0;
      let thisMonthSubmissions = 0;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const form: Form = {
          id: doc.id,
          title: data.title || 'Untitled Form',
          description: data.description || '',
          fields: data.blocks || data.fields || [],
          settings: data.settings || {},
          status: data.status || 'draft',
          createdAt: data.createdAt?.toDate() || new Date(),
          lastSubmission: data.lastSubmission?.toDate(),
          submissions: data.submissions || 0
        };
        formsList.push(form);
        totalSubmissions += form.submissions;

        const thisMonth = new Date().getMonth();
        const formMonth = form.lastSubmission ? form.lastSubmission.getMonth() : -1;
        if (formMonth === thisMonth) thisMonthSubmissions += form.submissions;
      });

      formsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      setForms(formsList);

      const avgSubmissionsPerForm = formsList.length > 0 ? totalSubmissions / formsList.length : 0;
      const submissionRate = Math.round(avgSubmissionsPerForm * 10) / 10;

      setStats({
        totalForms: formsList.length,
        totalSubmissions,
        conversionRate: submissionRate,
        thisMonthSubmissions
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching forms:', error);
      setLoading(false);
    } finally {
      setLoadingForms(false);
    }
  };

  const fetchLandingPages = async () => {
    if (!currentUser?.id) {
      console.log('fetchLandingPages: No currentUser.id available');
      return;
    }
    
    setLoadingLandingPages(true);
    try {
      const landingPagesQuery = query(collection(db, 'landingPages'), where('userId', '==', currentUser.id));
      const querySnapshot = await getDocs(landingPagesQuery);
      
      const landingPagesList: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const landingPage = {
          id: doc.id,
          title: data.title || 'Untitled Landing Page',
          headline: data.headline || '',
          status: data.status || 'draft',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          views: data.views || 0,
          submissions: data.submissions || 0,
          showMedia: data.showMedia || true,
          additionalLinks: data.additionalLinks || []
        };
        
        landingPagesList.push(landingPage);
      });
      
      landingPagesList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setLandingPages(landingPagesList);
      
    } catch (error) {
      console.error('Error fetching landing pages:', error);
    } finally {
      setLoadingLandingPages(false);
    }
  };

  const deleteLandingPage = async (landingPageId: string) => {
    if (!currentUser?.id) {
      alert('You must be logged in to delete landing pages.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this landing page? This action cannot be undone.');
    
    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingLandingPages(prev => new Set(prev).add(landingPageId));
      
      setLandingPages(prev => prev.filter(page => page.id !== landingPageId));
      
      await deleteDoc(doc(db, 'landingPages', landingPageId));
      
      console.log('Landing page deleted successfully');
      alert('Landing page deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting landing page:', error);
      fetchLandingPages();
      alert(`Error deleting landing page: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setDeletingLandingPages(prev => {
        const newSet = new Set(prev);
        newSet.delete(landingPageId);
        return newSet;
      });
    }
  };

  const fetchLinkOrganizers = async () => {
    if (!currentUser?.id) {
      console.log('fetchLinkOrganizers: No currentUser.id available');
      return;
    }
    
    setLoadingLinkOrganizers(true);
    try {
      const linkOrganizersQuery = query(collection(db, 'linkOrganizers'), where('userId', '==', currentUser.id));
      const querySnapshot = await getDocs(linkOrganizersQuery);
      
      const linkOrganizersList: any[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const linkOrganizer = {
          id: doc.id,
          title: data.title || 'Untitled Link Page',
          description: data.description || '',
          profileName: data.profileName || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          links: data.links || [],
          products: data.products || []
        };
        
        linkOrganizersList.push(linkOrganizer);
      });
      
      linkOrganizersList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setLinkOrganizers(linkOrganizersList);
      
    } catch (error) {
      console.error('Error fetching link organizers:', error);
    } finally {
      setLoadingLinkOrganizers(false);
    }
  };

  const deleteLinkOrganizer = async (linkOrganizerId: string) => {
    if (!currentUser?.id) {
      alert('You must be logged in to delete link organizers.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this link organizer? This action cannot be undone.');
    
    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingLinkOrganizers(prev => new Set(prev).add(linkOrganizerId));
      
      setLinkOrganizers(prev => prev.filter(organizer => organizer.id !== linkOrganizerId));
      
      await deleteDoc(doc(db, 'linkOrganizers', linkOrganizerId));
      
      console.log('Link organizer deleted successfully');
      alert('Link organizer deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting link organizer:', error);
      fetchLinkOrganizers();
      alert(`Error deleting link organizer: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setDeletingLinkOrganizers(prev => {
        const newSet = new Set(prev);
        newSet.delete(linkOrganizerId);
        return newSet;
      });
    }
  };

  const resetToFree = async () => {
    if (!currentUser?.id) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.id);
      await updateDoc(userRef, {
        subscription: 'free',
        maxForms: 3,
        maxLeads: 100,
        updatedAt: new Date()
      });
      
      // Refresh the page to show updated subscription
      window.location.reload();
    } catch (error) {
      console.error('Error resetting to free plan:', error);
      alert('Error resetting to free plan. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Template data for new forms
  const formTemplates = [
    {
      id: 'real-estate',
      name: 'Real Estate',
      description: 'Property listing and inquiry form',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-blue-50 to-blue-100 text-blue-600',
      questions: [
        { type: 'short_answer', label: 'Property Address', required: true, placeholder: 'Enter the full property address' },
        { type: 'dropdown', label: 'Property Type', required: true, options: ['House', 'Apartment', 'Condo', 'Townhouse', 'Land'] },
        { type: 'short_answer', label: 'Your Name', required: true, placeholder: 'Enter your full name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'phone', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' },
        { type: 'long_answer', label: 'Additional Requirements', required: false, placeholder: 'Any specific requirements or questions?' }
      ]
    },
    {
      id: 'hr',
      name: 'HR & Recruitment',
      description: 'Job application and onboarding',
      icon: <LayoutTemplate className="w-6 h-6" />,
      color: 'from-green-50 to-green-100 text-green-600',
      questions: [
        { type: 'short_answer', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'phone', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' },
        { type: 'dropdown', label: 'Position Applied For', required: true, options: ['Software Developer', 'Designer', 'Marketing', 'Sales', 'Administrative', 'Other'] },
        { type: 'file_upload', label: 'Resume/CV', required: true, helpText: 'Upload your resume (PDF, DOC, DOCX)' },
        { type: 'long_answer', label: 'Why are you interested in this position?', required: true, placeholder: 'Tell us about your interest and motivation' }
      ]
    },
    {
      id: 'house-party',
      name: 'Event RSVP',
      description: 'Event RSVP and guest management',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-purple-50 to-purple-100 text-purple-600',
      questions: [
        { type: 'short_answer', label: 'Your Name', required: true, placeholder: 'Enter your full name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'dropdown', label: 'Will you attend?', required: true, options: ['Yes, I\'ll be there!', 'No, I can\'t make it', 'Maybe, I\'ll let you know'] },
        { type: 'number', label: 'Number of Guests', required: false, placeholder: 'How many people are you bringing?' },
        { type: 'long_answer', label: 'Dietary Restrictions', required: false, placeholder: 'Any food allergies or dietary preferences?' },
        { type: 'long_answer', label: 'Song Requests', required: false, placeholder: 'Any songs you\'d like to hear at the party?' }
      ]
    },
    {
      id: 'basic',
      name: 'Basic Contact',
      description: 'Simple contact and inquiry form',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-gray-50 to-gray-100 text-gray-600',
      questions: [
        { type: 'short_answer', label: 'Name', required: true, placeholder: 'Enter your name' },
        { type: 'email', label: 'Email', required: true, placeholder: 'Enter your email address' },
        { type: 'phone', label: 'Phone', required: false, placeholder: 'Enter your phone number' },
        { type: 'dropdown', label: 'Subject', required: true, options: ['General Inquiry', 'Support Request', 'Partnership', 'Feedback', 'Other'] },
        { type: 'long_answer', label: 'Message', required: true, placeholder: 'Tell us how we can help you' }
      ]
    },
    {
      id: 'customer-feedback',
      name: 'Customer Feedback',
      description: 'Product and service feedback',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-orange-50 to-orange-100 text-orange-600',
      questions: [
        { type: 'short_answer', label: 'Customer Name', required: true, placeholder: 'Enter your name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'dropdown', label: 'Product/Service', required: true, options: ['Product A', 'Product B', 'Service C', 'Service D', 'Other'] },
        { type: 'linear_scale', label: 'Overall Satisfaction', required: true, scaleMin: 1, scaleMax: 5, scaleLabels: { min: 'Very Dissatisfied', max: 'Very Satisfied' } },
        { type: 'long_answer', label: 'What did you like most?', required: false, placeholder: 'Tell us what you enjoyed' },
        { type: 'long_answer', label: 'What could we improve?', required: false, placeholder: 'Share your suggestions for improvement' }
      ]
    }
  ];

  const handleTemplateSelect = (template: any) => {
    // Navigate to form builder with template data
    navigate('/builder', { 
      state: { 
        template: template,
        isFromTemplate: true 
      } 
    });
    setShowTemplateModal(false);
  };

  const handleBuildFromScratch = () => {
    // Navigate to form builder without template
    navigate('/builder');
    setShowTemplateModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <BrandedLoadingScreen message="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      {/* Navigation */}
      <nav className="bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src="/logoreal.png" alt="AdParlay" className="h-6 w-auto" />
              <span className="font-['Outfit'] font-bold text-lg tracking-tight">AdParlay</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-['Outfit'] text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Dashboard</h1>
              <p className="text-gray-500 font-medium">Manage your capture flows and analytics</p>
            </div>
            <div className="flex items-center gap-2 bg-white border border-gray-100 p-1.5 rounded-xl shadow-sm">
              <span className={`px-3 py-1 rounded-lg text-[12px] font-bold uppercase tracking-wider ${
                currentUser?.subscription === 'premium' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-500'
              }`}>
                {currentUser?.subscription === 'premium' ? 'Premium Plan' : 'Free Plan'}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <FileText className="w-12 h-12 text-gray-900" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Total Forms</p>
            <p className="font-['Outfit'] text-4xl font-black text-gray-900 tracking-tight">{stats.totalForms}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Eye className="w-12 h-12 text-gray-900" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Total Submissions</p>
            <p className="font-['Outfit'] text-4xl font-black text-gray-900 tracking-tight">{stats.totalSubmissions}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <LayoutTemplate className="w-12 h-12 text-gray-900" />
            </div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-4">Engagement</p>
            <p className="font-['Outfit'] text-4xl font-black text-gray-900 tracking-tight">{stats.conversionRate}<span className="text-lg font-bold text-gray-300 ml-1">avg</span></p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </div>
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.1em] mb-4">This Month</p>
            <p className="font-['Outfit'] text-4xl font-black text-white tracking-tight">{stats.thisMonthSubmissions}</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-gray-100/50 border border-gray-100 rounded-2xl mb-10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-[13px] uppercase tracking-wider transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-[13px] uppercase tracking-wider transition-all ${
              activeTab === 'analytics'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Advanced Analytics
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-[#333]">
              <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
              
              {/* Subscription Status Notifications */}
              {/* Skip notifications for test accounts */}
              {(() => {
                const testEmails = ['kingflamebeats@gmail.com', 'olugbodeoluwaseyi111@gmail.com'];
                const isTestAccount = currentUser?.email && testEmails.includes(currentUser.email.toLowerCase());
                
                if (isTestAccount) return null;
                
                // Countdown Timer for Active Subscription
                return currentUser?.subscription === 'premium' && 
                       currentUser?.paymentStatus === 'active' && 
                       currentUser?.daysTillExpiry && 
                       currentUser?.daysTillExpiry <= 15 && 
                       currentUser?.daysTillExpiry > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] font-bold text-blue-900 text-sm">Subscription Renewing Soon</h3>
                    <p className="text-blue-700 text-xs mt-1 font-medium leading-relaxed">
                      Your premium plan expires in {currentUser.daysTillExpiry} day{currentUser.daysTillExpiry === 1 ? '' : 's'}. Renew now to maintain uninterrupted access.
                    </p>
                  </div>
                </div>
                );
              })()}

              {/* Grace Period Warning */}
              {(() => {
                const testEmails = ['kingflamebeats@gmail.com', 'olugbodeoluwaseyi111@gmail.com'];
                const isTestAccount = currentUser?.email && testEmails.includes(currentUser.email.toLowerCase());
                
                if (isTestAccount) return null;
                
                return currentUser?.paymentStatus === 'grace' && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-['Outfit'] font-bold text-orange-900 text-sm">Grace Period Active</h3>
                    <p className="text-orange-700 text-xs mt-1 font-medium leading-relaxed">
                      Your subscription has expired but you have a temporary extension. Upgrade now to keep your forms active.
                    </p>
                  </div>
                </div>
                );
              })()}

              {/* Subscription Expired */}
              {(() => {
                const testEmails = ['kingflamebeats@gmail.com', 'olugbodeoluwaseyi111@gmail.com'];
                const isTestAccount = currentUser?.email && testEmails.includes(currentUser.email.toLowerCase());
                
                if (isTestAccount) return null;
                
                return (currentUser?.paymentStatus === 'expired' || (currentUser?.subscription === 'free' && currentUser?.maxLeads === 100)) && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block font-['Outfit'] font-bold text-red-900 text-sm">Subscription Expired</span>
                    <p className="text-red-700 text-xs mt-0.5 font-medium">Your access is currently limited. Renew your subscription to continue creating.</p>
                  </div>
                </div>
                );
              })()}

              {/* Form Limit Warning for Free Users */}
              {currentUser?.subscription === 'free' && forms.length >= (currentUser?.maxForms || 3) && (
                <div className="mb-4 p-3 bg-orange-900/20 border border-orange-500/50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-orange-400 text-sm font-medium">
                      You've reached your limit of {currentUser?.maxForms || 3} forms on the free plan.
                    </span>
                  </div>
                  <p className="text-orange-300 text-xs mt-1">
                    Delete some forms or upgrade to Premium for unlimited forms.
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <AnimatedDropdown 
                  text="+ Create New"
                  triggerClassName="bg-gray-900 text-white hover:bg-black font-bold text-[14px] rounded-xl px-8 shadow-lg shadow-black/10"
                  items={[
                    {
                      name: 'Form',
                      icon: <FileText className="w-4 h-4 text-purple-500" />,
                      onClick: () => {
                        if (currentUser?.subscription === 'free' && forms.length >= (currentUser?.maxForms || 3)) {
                          alert('You have reached your form limit. Please delete some forms or upgrade to Premium.');
                          return;
                        }
                        setShowTemplateModal(true);
                      }
                    },
                    {
                      name: 'Landing Page',
                      icon: <LayoutTemplate className="w-4 h-4 text-blue-500" />,
                      link: '/landing-builder'
                    },
                    {
                      name: 'Link Organizer',
                      icon: <LinkIcon className="w-4 h-4 text-pink-500" />,
                      link: '/link-organizer-builder'
                    }
                  ]}
                />
                {currentUser?.subscription === 'premium' ? (
                  <div className="px-6 py-3 bg-purple-50 text-purple-600 border border-purple-100 rounded-xl font-bold text-[14px] flex items-center justify-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Premium Access Active
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="px-8 py-3 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-[14px] hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <img src="/logoreal.png" alt="" className="w-4 h-4" />
                    Upgrade to Premium
                  </button>
                )}
              </div>
            </div>

            {/* Forms List */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Your Forms
                  {loadingForms && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRefresh}
                    className="min-h-[44px] px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                  <span className="text-gray-600 text-sm">{forms.length} forms</span>
                </div>
              </div>
              
              {forms.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg mb-4">No forms created yet</p>
                  <Link
                    to="/builder"
                    className="min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all inline-flex items-center justify-center"
                  >
                    Create Your First Form
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {forms.map((form) => (
                    <motion.div
                      key={form.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-purple-200 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(form.status)} shadow-[0_0_8px_currentColor]`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{form.status}</span>
                          </div>
                          <AnimatedDropdown 
                            align="right"
                            trigger={<button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><MoreVertical className="w-4 h-4"/></button>}
                            items={[
                              {
                                name: 'Edit Flow',
                                icon: <FileText className="w-4 h-4" />,
                                link: `/builder/${form.id}`
                              },
                              {
                                name: 'Workspace',
                                icon: <LayoutTemplate className="w-4 h-4" />,
                                link: `/workspace/${form.id}`
                              },
                              {
                                name: deletingForms.has(form.id) ? 'Deleting...' : 'Delete Form',
                                icon: <Trash2 className="w-4 h-4" />,
                                destructive: true,
                                onClick: () => { if (!deletingForms.has(form.id)) deleteForm(form.id); }
                              }
                            ]}
                          />
                        </div>
                        <h3 className="font-['Outfit'] font-extrabold text-xl text-gray-900 mb-2 truncate">{form.title}</h3>
                        <p className="text-gray-500 text-[13px] font-medium mb-8 line-clamp-2 leading-relaxed">{form.description || 'Premium data collection flow.'}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Submissions</p>
                          <p className="font-['Outfit'] font-black text-2xl text-gray-900">{form.submissions}</p>
                        </div>
                        <Link
                          to={`/builder/${form.id}`}
                          className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[12px] font-bold hover:bg-black transition-all shadow-lg shadow-black/5"
                        >
                          Edit
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Landing Pages List */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Your Landing Pages
                  {loadingLandingPages && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRefresh}
                    className="min-h-[44px] px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                  <span className="text-gray-600 text-sm">{landingPages.length} landing pages</span>
                </div>
              </div>
              
              {landingPages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg mb-4">No landing pages created yet</p>
                  <Link
                    to="/landing-builder"
                    className="min-h-[44px] px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all inline-flex items-center justify-center"
                  >
                    Create Your First Landing Page
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {landingPages.map((landingPage) => (
                    <motion.div
                      key={landingPage.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-green-200 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${landingPage.status === 'published' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-yellow-500 shadow-[0_0_8px_#eab308]'}`}></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{landingPage.status}</span>
                          </div>
                          <AnimatedDropdown 
                            align="right"
                            trigger={<button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><MoreVertical className="w-4 h-4"/></button>}
                            items={[
                              {
                                name: 'View Live',
                                icon: <Eye className="w-4 h-4" />,
                                onClick: () => { window.open(`/landing/${landingPage.id}`, '_blank'); }
                              },
                              {
                                name: 'Responses',
                                icon: <FileText className="w-4 h-4" />,
                                link: '/landing-responses'
                              },
                              {
                                name: deletingLandingPages.has(landingPage.id) ? 'Deleting...' : 'Delete Page',
                                icon: <Trash2 className="w-4 h-4" />,
                                destructive: true,
                                onClick: () => { if (!deletingLandingPages.has(landingPage.id)) deleteLandingPage(landingPage.id); }
                              }
                            ]}
                          />
                        </div>
                        <h3 className="font-['Outfit'] font-extrabold text-xl text-gray-900 mb-2 truncate">{landingPage.title}</h3>
                        <p className="text-gray-500 text-[13px] font-medium mb-8 line-clamp-2 leading-relaxed">{landingPage.headline || 'High-converting landing experience.'}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div className="flex gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Views</p>
                            <p className="font-['Outfit'] font-black text-xl text-gray-900">{landingPage.views}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Leads</p>
                            <p className="font-['Outfit'] font-black text-xl text-gray-900">{landingPage.submissions}</p>
                          </div>
                        </div>
                        <Link
                          to={`/landing-builder?edit=${landingPage.id}`}
                          className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[12px] font-bold hover:bg-black transition-all shadow-lg shadow-black/5"
                        >
                          Edit
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Link Organizers List */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  Your Link Organizers
                  {loadingLinkOrganizers && (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleRefresh}
                    className="min-h-[44px] px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                  <span className="text-gray-600 text-sm">{linkOrganizers.length} link organizers</span>
                </div>
              </div>
              
              {linkOrganizers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg mb-4">No link organizers created yet</p>
                  <Link
                    to="/link-organizer-builder"
                    className="min-h-[44px] px-6 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-all inline-flex items-center justify-center"
                  >
                    Create Your First Link Organizer
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {linkOrganizers.map((linkOrganizer) => (
                    <motion.div
                      key={linkOrganizer.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-white rounded-3xl p-6 border border-gray-100 hover:border-orange-200 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316]"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Active</span>
                          </div>
                          <AnimatedDropdown 
                            align="right"
                            trigger={<button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"><MoreVertical className="w-4 h-4"/></button>}
                            items={[
                              {
                                name: 'View Live',
                                icon: <Eye className="w-4 h-4" />,
                                onClick: () => { window.open(linkOrganizer.username ? `/${linkOrganizer.username}` : `/link/${linkOrganizer.id}`, '_blank'); }
                              },
                              {
                                name: deletingLinkOrganizers.has(linkOrganizer.id) ? 'Deleting...' : 'Delete Organizer',
                                icon: <Trash2 className="w-4 h-4" />,
                                destructive: true,
                                onClick: () => { if (!deletingLinkOrganizers.has(linkOrganizer.id)) deleteLinkOrganizer(linkOrganizer.id); }
                              }
                            ]}
                          />
                        </div>
                        <h3 className="font-['Outfit'] font-extrabold text-xl text-gray-900 mb-2 truncate">{linkOrganizer.title}</h3>
                        <p className="text-gray-500 text-[13px] font-medium mb-8 line-clamp-2 leading-relaxed">{linkOrganizer.description || 'Professional link collection.'}</p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Links</p>
                          <p className="font-['Outfit'] font-black text-2xl text-gray-900">{linkOrganizer.links.length}</p>
                        </div>
                        <Link
                          to={`/link-organizer-builder/${linkOrganizer.id}`}
                          className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-[12px] font-bold hover:bg-black transition-all shadow-lg shadow-black/5"
                        >
                          Edit
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <AdvancedAnalytics 
            key={currentUser?.id || 'analytics'}
            userId={currentUser?.id || ''} 
            isProUser={currentUser?.subscription === 'premium'}
          />
        )}
      </div>

      {/* Template Selection Modal */}
      {/* Template Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/40 backdrop-blur-xl flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="bg-white rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <div className="p-8 sm:p-10">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-3xl font-black font-['Outfit'] text-gray-900 tracking-tight">Choose Template</h3>
                    <p className="text-gray-500 font-medium mt-1">Select a starting point for your new form.</p>
                  </div>
                  <button
                    onClick={() => setShowTemplateModal(false)}
                    className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 p-2 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {formTemplates.map((template) => (
                    <motion.div
                      whileHover={{ y: -4, shadow: "0 10px 25px rgba(0,0,0,0.05)" }}
                      key={template.id}
                      className="group border border-gray-100 bg-white rounded-2xl p-6 cursor-pointer transition-all hover:border-purple-200"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 bg-gradient-to-br ${template.color}`}>
                        {template.icon}
                      </div>
                      <h4 className="font-['Outfit'] font-bold text-lg text-gray-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium">{template.description}</p>
                    </motion.div>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-gray-100">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="relative rounded-2xl overflow-hidden p-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 shadow-lg shadow-purple-500/10"
                  >
                    <div className="relative bg-white h-full rounded-[15px] p-7 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                            <img src="/logoreal.png" alt="" className="w-5 h-5" />
                          </div>
                          <span className="font-['Outfit'] font-extrabold text-xl text-gray-900">AI Builder</span>
                        </div>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">Describe your vision and let our AI engine generate a complete capture flow in seconds.</p>
                      </div>
                      
                      {currentUser?.subscription === 'premium' ? (
                        <button
                          onClick={() => {
                            setShowTemplateModal(false);
                            setShowAIBuilderModal(true);
                          }}
                          className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10"
                        >
                          Generate with AI
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowTemplateModal(false);
                            setShowPaymentModal(true);
                          }}
                          className="w-full py-4 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl font-bold text-sm hover:bg-gray-100 hover:text-gray-900 transition-all"
                        >
                          Unlock AI with Premium
                        </button>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="border border-gray-100 bg-gray-50/30 rounded-2xl p-7 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 mb-5 border border-gray-100 shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <h4 className="font-['Outfit'] font-bold text-xl text-gray-900 mb-2">Build from Scratch</h4>
                      <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">Start with a blank canvas and piece together your ideal form field by field.</p>
                    </div>
                    <button
                      onClick={handleBuildFromScratch}
                      className="w-full py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
                    >
                      Start Blank Form
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Upgrade to Premium</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <PaystackPayment 
                onSuccess={() => {
                  setShowPaymentModal(false);
                  // Refresh the page to show updated subscription
                  window.location.reload();
                }}
                onClose={() => setShowPaymentModal(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Builder Modal */}
      {showAIBuilderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">AI Form Builder</h3>
                <button
                  onClick={() => setShowAIBuilderModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <AIBuilder 
                onSuccess={(formData) => {
                  setShowAIBuilderModal(false);
                  // Navigate to form builder with AI-generated data
                  navigate('/builder', { 
                    state: { 
                      aiGeneratedForm: formData,
                      isFromAI: true 
                    } 
                  });
                }}
                onClose={() => setShowAIBuilderModal(false)} 
              />
            </div>
          </div>
        </div>
      )}

      {/* View Responses Modal */}
      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          userId={currentUser?.id || ''}
          isProUser={currentUser?.subscription === 'premium'}
        />
      )}
      
      {/* Auth Debugger - Only in development */}

    </div>
  );
};

export default Dashboard;
