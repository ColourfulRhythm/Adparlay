import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useSEO } from '../hooks/useSEO';
import { Input, Label, BottomGradient } from '../components/ui/AuthComponents';


const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const { login, currentUser, loading: authLoading, resetPassword, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // SEO optimization
  useSEO({
    title: 'Login - Adparlay | Access Your Form Builder Account',
    description: 'Sign in to your Adparlay account to manage your forms, view analytics, and create beautiful lead capture forms.',
    canonical: 'https://adparlaysaas.web.app/login'
  });

  // Redirect if user is already logged in
  React.useEffect(() => {
    if (currentUser && !authLoading) {
      navigate('/dashboard');
    }
  }, [currentUser, authLoading, navigate]);

  
  const handleGoogleLogin = useCallback(async () => {
    try {
      setError('');
      setGoogleLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Google Auth error:', error);
      setError(error.message || 'Failed to authenticate with Google.');
    } finally {
      setGoogleLoading(false);
    }
  }, [signInWithGoogle]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      // Attempt login
      await login(email, password);
      
      // Navigation will be handled by the useEffect above
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Failed to login. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, loading, login]);

  const handlePasswordReset = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      setResetLoading(true);
      setError('');
      setResetMessage('');
      
      await resetPassword(email);
      setResetMessage('Password reset email sent! Check your inbox and spam folder.');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  }, [email, resetPassword]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Side - Enhanced Visual Section */}
      <div className="lg:w-1/2 lg:h-screen relative overflow-hidden bg-gradient-to-br from-[#1a0b2e] via-[#050505] to-[#000]">
        {/* Mobile: Top 40% of screen - #AD SECTION */}
        <div className="lg:hidden h-[40vh] relative overflow-hidden">
          {/* YouTube Video - Sponsored Ad */}
          <div className="absolute inset-0">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=1&rel=0"
              title="2 Seasons - A regenerative City in Kobape, Abeokuta - Sponsored Ad"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Ad Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-white px-6"
            >
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <svg className="w-8 h-8 text-inherit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
              <p className="text-sm text-[#b8b8b8]">Build beautiful forms that convert</p>
            </motion.div>
          </div>
        </div>
        
        {/* Desktop: Full height video with overlay - #AD SECTION */}
        <div className="hidden lg:block lg:h-full relative">
          {/* YouTube Video - Sponsored Ad */}
          <div className="absolute inset-0">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=1&rel=0"
              title="2 Seasons - A regenerative City in Kobape, Abeokuta - Sponsored Ad"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Ad Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center text-white px-12 max-w-lg"
            >
              {/* Logo */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-3xl font-extrabold font-['Outfit'] tracking-tight text-white mb-2"
              >
                Welcome back
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="text-[#b8b8b8] font-['Epilogue']"
              >
                Sign in to your account or{' '}
                <Link to="/register" className="font-semibold text-[#bf80ff] hover:text-[#d4a0ff] transition-colors">
                  create a new account
                </Link>
              </motion.p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md bg-[#0d0d0d] rounded-2xl shadow-xl p-8 border border-white/10"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-16 h-16 bg-[#141414] border border-white/10 text-[#bf80ff] rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
              </svg>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-3xl font-extrabold font-['Outfit'] tracking-tight text-white mb-2"
            >
              Welcome back
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-[#b8b8b8] font-['Epilogue']"
            >
              Please enter your details
            </motion.p>
          </div>

          {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="group relative w-full flex justify-center items-center gap-3 py-3.5 px-6 border border-white/10 rounded-xl text-white bg-[#141414] hover:bg-[#1f1f1f] font-['Epilogue'] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {googleLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </div>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Sign in with Google
                    </>
                  )}
                  <BottomGradient />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="flex items-center gap-4 my-2"
              >
                <hr className="flex-1 border-white/10" />
                <span className="text-xs text-[#666] uppercase font-semibold tracking-wider font-['Epilogue']">or continue with email</span>
                <hr className="flex-1 border-white/10" />
              </motion.div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {resetMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">{resetMessage}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                >
                  <Label htmlFor="email" className="mb-2 block">
                    Email address
                  </Label>
                  <div className="relative">
                    <Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1.3 }}
                >
                  <Label htmlFor="password" className="mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.5 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#bf80ff] focus:ring-[#bf80ff] border-white/10 bg-[#141414] rounded transition-colors"
                  />
                  <Label htmlFor="remember-me" className="ml-2 block text-sm">
                    Remember me
                  </Label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={resetLoading}
                    className="font-semibold text-[#bf80ff] hover:text-[#d4a0ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? 'Sending...' : 'Forgot password?'}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.7 }}
              >
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-base font-semibold rounded-xl text-white bg-[#141414] border border-white/10 text-[#bf80ff] hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-inherit" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    <span className="flex items-center">
                      Sign in
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </span>
                  )}
                <BottomGradient />
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1.9 }}
                className="text-center pt-6 border-t border-gray-700"
              >
                <p className="text-sm text-[#b8b8b8] font-['Epilogue']">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-[#bf80ff] hover:text-[#d4a0ff] transition-colors">
                    Create one here
                  </Link>
                </p>
              </motion.div>
            </form>
          </motion.div>
      </div>
    </div>
  );
};

export default Login;
