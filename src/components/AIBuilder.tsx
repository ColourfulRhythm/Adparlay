import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

interface AIBuilderProps {
  onSuccess: (formData: any) => void;
  onClose: () => void;
}

const AIBuilder: React.FC<AIBuilderProps> = ({ onSuccess, onClose }) => {
  const { currentUser } = useAuth();
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [dailyUsage, setDailyUsage] = useState(0);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      loadDailyUsage();
    }
  }, [currentUser?.id]);

  const loadDailyUsage = async () => {
    if (!currentUser?.id) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const today = new Date().toDateString();
        const lastUsageDate = userData.lastAIGenerationDate;
        
        if (lastUsageDate === today) {
          setDailyUsage(userData.dailyAIGenerations || 0);
        } else {
          setDailyUsage(0);
        }
      }
    } catch (error) {
      console.error('Error loading daily usage:', error);
    } finally {
      setIsLoadingUsage(false);
    }
  };

  const generateForm = async () => {
    if (!description.trim()) {
      setError('Please describe what kind of form you want to create.');
      return;
    }

    if (dailyUsage >= 10) {
      setError('You have reached your daily limit of 10 AI-generated forms. Please try again tomorrow.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const formData = await callGoogleCloudAI(description);
      await updateDailyUsage();
      onSuccess(formData);
    } catch (error) {
      console.error('Error generating form:', error);
      setError('Failed to generate form. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const callGoogleCloudAI = async (prompt: string): Promise<any> => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Enhanced form type detection with more categories
    let formType = 'general';
    let questions = [];
    let formTitle = '';
    
    // Real Estate & Property
    if (lowerPrompt.includes('real estate') || lowerPrompt.includes('property') || lowerPrompt.includes('house') || 
        lowerPrompt.includes('apartment') || lowerPrompt.includes('rent') || lowerPrompt.includes('buy') || 
        lowerPrompt.includes('home') || lowerPrompt.includes('listing')) {
      formType = 'real-estate';
      formTitle = 'Property Inquiry Form';
      questions = [
        { type: 'short_answer', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'phone', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' },
        { type: 'dropdown', label: 'Property Type', required: true, options: ['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial'] },
        { type: 'short_answer', label: 'Preferred Location', required: true, placeholder: 'City, neighborhood, or area' },
        { type: 'dropdown', label: 'Budget Range', required: true, options: ['Under $200k', '$200k - $400k', '$400k - $600k', '$600k - $1M', 'Over $1M'] },
        { type: 'dropdown', label: 'Bedrooms', required: false, options: ['1', '2', '3', '4', '5+', 'Any'] },
        { type: 'dropdown', label: 'Bathrooms', required: false, options: ['1', '1.5', '2', '2.5', '3+', 'Any'] },
        { type: 'long_answer', label: 'Additional Requirements', required: false, placeholder: 'Any specific features or requirements?' }
      ];
    }
    // Job Applications & HR
    else if (lowerPrompt.includes('job') || lowerPrompt.includes('employment') || lowerPrompt.includes('hr') || 
             lowerPrompt.includes('recruitment') || lowerPrompt.includes('career') || lowerPrompt.includes('apply') ||
             lowerPrompt.includes('resume') || lowerPrompt.includes('cv')) {
      formType = 'hr';
      formTitle = 'Job Application Form';
      questions = [
        { type: 'short_answer', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'phone', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' },
        { type: 'short_answer', label: 'Position Applied For', required: true, placeholder: 'Enter the job title' },
        { type: 'file_upload', label: 'Resume/CV', required: true, helpText: 'Upload your resume (PDF, DOC, DOCX)' },
        { type: 'file_upload', label: 'Cover Letter', required: false, helpText: 'Upload your cover letter (optional)' },
        { type: 'dropdown', label: 'Experience Level', required: true, options: ['Entry Level (0-2 years)', 'Mid Level (3-5 years)', 'Senior Level (6-10 years)', 'Executive (10+ years)'] },
        { type: 'long_answer', label: 'Why are you interested in this position?', required: true, placeholder: 'Tell us about your interest and motivation' },
        { type: 'long_answer', label: 'Relevant Experience', required: true, placeholder: 'Describe your relevant work experience' }
      ];
    }
    // Events & RSVP
    else if (lowerPrompt.includes('event') || lowerPrompt.includes('party') || lowerPrompt.includes('rsvp') ||
             lowerPrompt.includes('wedding') || lowerPrompt.includes('birthday') || lowerPrompt.includes('conference') ||
             lowerPrompt.includes('meeting') || lowerPrompt.includes('gathering')) {
      formType = 'event';
      formTitle = 'Event RSVP Form';
      questions = [
        { type: 'short_answer', label: 'Your Name', required: true, placeholder: 'Enter your full name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'phone', label: 'Phone Number', required: false, placeholder: 'Enter your phone number' },
        { type: 'dropdown', label: 'Will you attend?', required: true, options: ['Yes, I\'ll be there!', 'No, I can\'t make it', 'Maybe, I\'ll let you know'] },
        { type: 'number', label: 'Number of Guests', required: false, placeholder: 'How many people are you bringing?' },
        { type: 'long_answer', label: 'Dietary Restrictions', required: false, placeholder: 'Any food allergies or dietary preferences?' },
        { type: 'long_answer', label: 'Special Requests', required: false, placeholder: 'Any special accommodations or requests?' }
      ];
    }
    // Feedback & Surveys
    else if (lowerPrompt.includes('feedback') || lowerPrompt.includes('review') || lowerPrompt.includes('survey') ||
             lowerPrompt.includes('rating') || lowerPrompt.includes('opinion') || lowerPrompt.includes('satisfaction')) {
      formType = 'feedback';
      formTitle = 'Customer Feedback Form';
      questions = [
        { type: 'short_answer', label: 'Full Name', required: true, placeholder: 'Enter your name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'dropdown', label: 'Product/Service', required: true, options: ['Product A', 'Product B', 'Service C', 'Service D', 'Other'] },
        { type: 'linear_scale', label: 'Overall Satisfaction', required: true, scaleMin: 1, scaleMax: 5, scaleLabels: { min: 'Very Dissatisfied', max: 'Very Satisfied' } },
        { type: 'linear_scale', label: 'Would you recommend us?', required: true, scaleMin: 1, scaleMax: 10, scaleLabels: { min: 'Not likely', max: 'Very likely' } },
        { type: 'long_answer', label: 'What did you like most?', required: false, placeholder: 'Tell us what you enjoyed' },
        { type: 'long_answer', label: 'What could we improve?', required: false, placeholder: 'Share your suggestions for improvement' }
      ];
    }
    // Contact & Support
    else if (lowerPrompt.includes('contact') || lowerPrompt.includes('support') || lowerPrompt.includes('help') ||
             lowerPrompt.includes('inquiry') || lowerPrompt.includes('question') || lowerPrompt.includes('assistance')) {
      formType = 'contact';
      formTitle = 'Contact Us Form';
      questions = [
        { type: 'short_answer', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'phone', label: 'Phone Number', required: false, placeholder: 'Enter your phone number' },
        { type: 'dropdown', label: 'Subject', required: true, options: ['General Inquiry', 'Support Request', 'Partnership', 'Feedback', 'Billing', 'Technical Issue', 'Other'] },
        { type: 'dropdown', label: 'Priority', required: true, options: ['Low', 'Medium', 'High', 'Urgent'] },
        { type: 'long_answer', label: 'Message', required: true, placeholder: 'Tell us how we can help you' }
      ];
    }
    // Registration & Signup
    else if (lowerPrompt.includes('register') || lowerPrompt.includes('signup') || lowerPrompt.includes('sign up') ||
             lowerPrompt.includes('enroll') || lowerPrompt.includes('join') || lowerPrompt.includes('membership')) {
      formType = 'registration';
      formTitle = 'Registration Form';
      questions = [
        { type: 'short_answer', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'phone', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' },
        { type: 'short_answer', label: 'Company/Organization', required: false, placeholder: 'Enter your company name' },
        { type: 'dropdown', label: 'Experience Level', required: true, options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
        { type: 'long_answer', label: 'Why are you interested?', required: true, placeholder: 'Tell us about your interest' }
      ];
    }
    // Lead Generation
    else if (lowerPrompt.includes('lead') || lowerPrompt.includes('prospect') || lowerPrompt.includes('quote') ||
             lowerPrompt.includes('estimate') || lowerPrompt.includes('demo') || lowerPrompt.includes('consultation')) {
      formType = 'lead-generation';
      formTitle = 'Lead Generation Form';
      questions = [
        { type: 'short_answer', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
        { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email address' },
        { type: 'phone', label: 'Phone Number', required: true, placeholder: 'Enter your phone number' },
        { type: 'short_answer', label: 'Company Name', required: true, placeholder: 'Enter your company name' },
        { type: 'dropdown', label: 'Company Size', required: true, options: ['1-10 employees', '11-50 employees', '51-200 employees', '201-1000 employees', '1000+ employees'] },
        { type: 'dropdown', label: 'Industry', required: true, options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Other'] },
        { type: 'long_answer', label: 'Project Details', required: true, placeholder: 'Tell us about your project or needs' }
      ];
    }
    // Default general form
    else {
      formType = 'general';
      formTitle = 'Contact Form';
      questions = [
        { type: 'short_answer', label: 'Name', required: true, placeholder: 'Enter your name' },
        { type: 'email', label: 'Email', required: true, placeholder: 'Enter your email address' },
        { type: 'phone', label: 'Phone', required: false, placeholder: 'Enter your phone number' },
        { type: 'dropdown', label: 'Subject', required: true, options: ['General Inquiry', 'Support Request', 'Partnership', 'Feedback', 'Other'] },
        { type: 'long_answer', label: 'Message', required: true, placeholder: 'Tell us how we can help you' }
      ];
    }

    // Use the predefined title or generate one
    const finalTitle = formTitle || generateFormTitle(prompt, formType);
    
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      title: finalTitle,
      description: `Welcome to our ${formType.replace('-', ' ')} form. Please fill out the information below.`,
      media: {
        type: 'image',
        url: '',
        alt: 'Form Media',
        primaryDescription: `Welcome to our ${formType.replace('-', ' ')} form`,
        secondaryDescription: 'Please fill out the information below'
      },
      blocks: [
        {
          id: `block-${Date.now()}`,
          title: 'Page 1',
          description: `Please complete the following ${formType.replace('-', ' ')} form`,
          questions: questions.map((q: any, index: number) => ({
            id: `question-${Date.now()}-${index}`,
            type: q.type,
            label: q.label,
            placeholder: q.placeholder || '',
            required: q.required !== undefined ? q.required : false,
            options: q.options || [],
            helpText: q.helpText || '',
            validation: q.validation || {},
            scaleMin: q.scaleMin || 1,
            scaleMax: q.scaleMax || 5,
            scaleLabels: q.scaleLabels || { min: '1', max: '5' },
            gridRows: q.gridRows || [],
            gridColumns: q.gridColumns || []
          }))
        }
      ]
    };
  };

  const generateFormTitle = (prompt: string, formType: string): string => {
    const words = prompt.split(' ').slice(0, 4);
    const title = words.join(' ').replace(/\b\w/g, l => l.toUpperCase());
    return `${title} Form`;
  };

  const updateDailyUsage = async () => {
    if (!currentUser?.id) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.id);
      const today = new Date().toDateString();
      
      await updateDoc(userRef, {
        dailyAIGenerations: increment(1),
        lastAIGenerationDate: today
      });
      
      setDailyUsage(prev => prev + 1);
    } catch (error) {
      console.error('Error updating daily usage:', error);
    }
  };

  return (
    <div className="space-y-8 font-['Epilogue']">
      {!isLoadingUsage && (
        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-purple-100 flex items-center justify-center shadow-sm">
              <img src="/logoreal.png" alt="" className="w-5 h-5" />
            </div>
            <div>
              <span className="block text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">Daily Allowance</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 bg-purple-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${(dailyUsage / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="text-purple-900 font-bold text-sm">{dailyUsage}/10</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Resets in</span>
            <span className="block text-purple-900 font-bold text-xs">Midnight</span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
          Describe your vision
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., I need a high-converting real estate lead capture form for luxury property inquiries in Lagos..."
          className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[20px] focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all resize-none font-medium text-gray-900 min-h-[160px] outline-none shadow-inner"
          disabled={isGenerating}
        />
        <p className="text-[11px] text-gray-400 font-bold mt-3 uppercase tracking-wider">
          💡 Pro Tip: Mention your industry and target audience for better fields.
        </p>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <span className="text-red-900 font-bold text-sm">{error}</span>
        </motion.div>
      )}

      <div className="flex gap-4">
        <button
          onClick={generateForm}
          disabled={isGenerating || dailyUsage >= 10 || !description.trim()}
          className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
              <span>Engineered by AI...</span>
            </>
          ) : (
            <>
              <img src="/logoreal.png" alt="" className="w-4 h-4 brightness-0 invert opacity-50 group-hover:opacity-100 transition-opacity" />
              <span>Generate Flow</span>
            </>
          )}
        </button>
        
        <button
          onClick={onClose}
          disabled={isGenerating}
          className="px-8 py-4 bg-white text-gray-400 hover:text-gray-900 border border-gray-100 rounded-2xl font-bold text-sm transition-all"
        >
          Cancel
        </button>
      </div>

      <div className="bg-gray-50/50 border border-gray-100 rounded-[24px] p-6">
        <h4 className="font-['Outfit'] font-black text-gray-900 uppercase tracking-widest text-[11px] mb-4">How it works</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">1</div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">AI analyzes your description and determines the ideal data flow.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">2</div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed">It generates industry-standard fields and conversion-focused logic.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBuilder;
