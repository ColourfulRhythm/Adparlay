import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PremiumProtectedRouteProps {
  children: React.ReactNode;
}

const PremiumProtectedRoute: React.FC<PremiumProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has premium access (active premium subscription, not in grace or expired)
  // Special test accounts with unlimited access
  const testEmails = ['kingflamebeats@gmail.com', 'olugbodeoluwaseyi111@gmail.com'];
  const isTestAccount = currentUser.email && testEmails.includes(currentUser.email.toLowerCase());
  
  const hasPremiumAccess = isTestAccount || (currentUser.subscription === 'premium' && 
                         currentUser.paymentStatus === 'active');

  if (!hasPremiumAccess) {
    const isInGracePeriod = currentUser.paymentStatus === 'grace';
    const isExpired = currentUser.subscription === 'free' || 
                     (!currentUser.subscriptionExpiryDate) || 
                     currentUser.paymentStatus === 'expired';

    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 font-['Epilogue']">
        <div className="max-w-md w-full bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 p-10 text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <img src="/logoreal.png" alt="AdParlay" className="w-10 h-10" />
            </div>
            
            {isInGracePeriod ? (
              <>
                <h2 className="text-3xl font-black font-['Outfit'] text-gray-900 tracking-tight mb-3">Grace Period</h2>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                  Your subscription has expired but you're in a grace period. Upgrade now to maintain full access to your campaigns.
                </p>
              </>
            ) : isExpired ? (
              <>
                <h2 className="text-3xl font-black font-['Outfit'] text-gray-900 tracking-tight mb-3">Renew Premium</h2>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                  Your access to this premium feature has expired. Renew your plan to continue growing your brand.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-black font-['Outfit'] text-gray-900 tracking-tight mb-3">Premium Only</h2>
                <p className="text-gray-500 font-medium leading-relaxed mb-8">
                  Landing pages are a premium feature. Join our pro community to unlock high-converting designs.
                </p>
              </>
            )}
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10"
            >
              {isInGracePeriod ? 'Upgrade Now' : isExpired ? 'Renew Subscription' : 'Unlock Premium'}
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-white text-gray-500 py-3 px-6 rounded-2xl font-bold text-sm hover:text-gray-900 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          
          <div className="mt-10 pt-10 border-t border-gray-50 text-left">
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Premium Benefits</p>
            <ul className="grid grid-cols-1 gap-3">
              {[
                'Unlimited Landing Pages',
                'Custom Domain Mapping',
                'Advanced Form Logic',
                'Deep Conversion Analytics'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100 flex-shrink-0">
                    <svg className="w-3 h-3 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PremiumProtectedRoute;
