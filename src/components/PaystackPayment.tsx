import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface PaystackPaymentProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

const PaystackPayment: React.FC<PaystackPaymentProps> = ({ onSuccess, onClose }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Test accounts don't need to pay - grant automatic premium access
  const testEmails = ['kingflamebeats@gmail.com', 'olugbodeoluwaseyi111@gmail.com'];
  const isTestAccount = currentUser?.email && testEmails.includes(currentUser.email.toLowerCase());

  // Test account automatic upgrade
  const handleTestAccount = useCallback(async () => {
    if (!isTestAccount || !currentUser?.id) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.id);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          subscription: 'premium',
          paymentStatus: 'active',
          maxForms: 999999,
          maxLeads: 999999,
          updatedAt: new Date()
        });
      }
      
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error upgrading test account:', error);
    }
  }, [currentUser, isTestAccount, onSuccess, onClose]);

  // Handle test account on component mount
  useEffect(() => {
    if (isTestAccount && onSuccess) {
      handleTestAccount();
    }
  }, [isTestAccount, handleTestAccount, onSuccess]);

  // Define callback functions outside the handlePayment function using useCallback
  const handlePaymentSuccess = useCallback(async (response: any) => {
    console.log('Payment callback received:', response);
    try {
      if (!currentUser?.id) return;
      
      // Payment successful, update user subscription
      const userRef = doc(db, 'users', currentUser.id);
      
      // First check if user document exists
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Update existing user document
        await updateDoc(userRef, {
          subscription: 'premium',
          subscriptionDate: new Date(),
          subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          paymentStatus: 'active',
          paystackReference: response.reference,
          maxForms: 999999,
          maxLeads: 999999,
          updatedAt: new Date()
        });
      } else {
        // Create new user document with premium subscription
        await setDoc(userRef, {
          id: currentUser.id,
          email: currentUser.email,
          displayName: currentUser.displayName,
          subscription: 'premium',
          subscriptionDate: new Date(),
          subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          paymentStatus: 'active',
          paystackReference: response.reference,
          formsCount: 0,
          leadsCount: 0,
          maxForms: 999999,
          maxLeads: 999999,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      console.log('User subscription updated successfully');
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      alert('Payment successful! Your account has been upgraded to Pro.');
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Payment successful but there was an error updating your account. Please contact support.');
    }
  }, [currentUser, onSuccess]);

  const handlePaymentClose = useCallback(() => {
    console.log('Payment modal closed');
    setLoading(false);
    alert('Payment cancelled. You can try again anytime.');
  }, []);

  const handlePayment = async () => {
    if (!currentUser?.id) {
      alert('Please log in to make a payment.');
      return;
    }
    
    console.log('PaystackPop available:', !!(window as any).PaystackPop);
    console.log('Current user:', currentUser);
    
    // Wait for Paystack to be available
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!(window as any).PaystackPop && attempts < maxAttempts) {
      console.log(`Waiting for Paystack to load... Attempt ${attempts + 1}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      attempts++;
    }
    
    if (!(window as any).PaystackPop) {
      alert('Payment system is not available. Please refresh the page and try again.');
      return;
    }
    
    setLoading(true);
    try {
      // Create a simple function reference that Paystack can call
      const callbackFunction = function(response: any) {
        console.log('Paystack callback triggered with:', response);
        handlePaymentSuccess(response);
      };
      
      const closeFunction = function() {
        console.log('Paystack close triggered');
        handlePaymentClose();
      };
      
      const paymentConfig = {
        key: 'pk_live_65167bc2839df9c0dc11ca91e608ce2635abf44b', // Live public key
        email: currentUser.email || 'user@example.com',
        amount: 209900, // Amount in kobo (₦2,099)
        currency: 'NGN',
        ref: `pro_upgrade_${Date.now()}`,
        callback: callbackFunction,
        onClose: closeFunction
      };
      
      console.log('Initializing Paystack with config:', paymentConfig);
      console.log('Callback function type:', typeof paymentConfig.callback);
      console.log('Callback function:', paymentConfig.callback);
      console.log('PaystackPop object:', (window as any).PaystackPop);
      
      // Initialize Paystack payment
      const handler = (window as any).PaystackPop.setup(paymentConfig);
      
      console.log('Paystack handler created:', handler);
      handler.openIframe();
    } catch (error) {
      console.error('Error initializing payment:', error);
      alert(`Error initializing payment: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[28px] border border-gray-100 p-10 max-w-lg mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <img src="/logoreal.png" alt="AdParlay" className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-black font-['Outfit'] text-gray-900 tracking-tight mb-3">Elevate to Premium</h3>
        <p className="text-gray-500 font-medium leading-relaxed">Unlock the full power of AdParlay with unlimited forms, lead capture, and deep analytics.</p>
      </div>

      <div className="mb-10">
        <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-6 mb-8 flex items-center justify-between">
          <div>
            <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Premium Plan</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black font-['Outfit'] text-gray-900 tracking-tight">₦2,099</span>
              <span className="text-gray-400 font-medium text-sm">/ month</span>
            </div>
          </div>
          <div className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[11px] font-bold uppercase tracking-wider border border-purple-100">
            Best Value
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-10">
          {[
            'Unlimited forms & landing pages',
            'Unlimited lead submissions',
            'Advanced Data Analysis engine',
            'Premium PDF & Data Export',
            'AI-powered flow building'
          ].map((feat, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
                <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-600 font-medium text-sm">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
          ) : (
            <>
              <span>Upgrade Now</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7-7 7M5 12h16" />
              </svg>
            </>
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-3 text-gray-400 hover:text-gray-900 font-bold text-sm transition-colors"
          >
            Continue with Free Plan
          </button>
        )}
      </div>

      <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-center gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Secure Payment via Paystack</span>
      </div>
    </div>
  );
};

export default PaystackPayment;
