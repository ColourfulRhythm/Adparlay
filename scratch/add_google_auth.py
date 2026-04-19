import re

def update_auth_context():
    filepath = 'src/contexts/AuthContext.tsx'
    with open(filepath, 'r') as f:
        content = f.read()

    # Add imports
    content = content.replace('sendPasswordResetEmail\n}', 'sendPasswordResetEmail,\n  GoogleAuthProvider,\n  signInWithPopup\n}')

    # Add to AuthContextType
    content = content.replace('resetPassword: (email: string) => Promise<void>;', 'resetPassword: (email: string) => Promise<void>;\n  signInWithGoogle: () => Promise<User>;')

    # Add signInWithGoogle function
    func = """
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const userProfile = await fetchUserProfile(result.user);
      setCurrentUser(userProfile);
      return userProfile;
    } catch (error: any) {
      logAuthError(error, 'googleLogin');
      const errorMessage = getAuthErrorMessage(error);
      console.error('Google Login failed:', errorMessage);
      throw new Error(errorMessage);
    }
  };
"""
    content = content.replace('const logout = async () => {', func + '\n  const logout = async () => {')

    # Add to value object
    content = content.replace('resetPassword,\n  };', 'resetPassword,\n    signInWithGoogle,\n  };')

    with open(filepath, 'w') as f:
        f.write(content)


def remove_icons(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The icon blocks look like this:
    # <motion.div
    #   initial={{ scale: 0.8, opacity: 0 }}
    #   ...
    #   <svg className="w-8 h-8 ...
    #     ...
    #   </svg>
    # </motion.div>
    # They are just before the <motion.h2>
    # Let's use regex to remove it
    import re
    # Matches the specific icon div in Login and Register
    pattern = r'\s*<motion\.div\s+initial=\{\{ scale: 0\.8, opacity: 0 \}\}[\s\S]*?</motion\.div>\s*<motion\.h2'
    content = re.sub(pattern, '\n              <motion.h2', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

def add_google_button(filepath, is_register):
    with open(filepath, 'r') as f:
        content = f.read()
        
    google_btn_text = 'Sign up with Google' if is_register else 'Sign in with Google'
    
    google_html = f"""
              <motion.div
                initial={{{{ opacity: 0, y: 20 }}}}
                animate={{{{ opacity: 1, y: 0 }}}}
                transition={{{{ duration: 0.5, delay: 0.8 }}}}
              >
                <button
                  type="button"
                  onClick={{handleGoogleLogin}}
                  disabled={{googleLoading}}
                  className="group relative w-full flex justify-center items-center gap-3 py-3.5 px-6 border border-white/10 rounded-xl text-white bg-[#141414] hover:bg-[#1f1f1f] font-['Epilogue'] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{googleLoading ? (
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
                      {google_btn_text}
                    </>
                  )}}
                  <BottomGradient />
                </button>
              </motion.div>

              <motion.div
                initial={{{{ opacity: 0, y: 20 }}}}
                animate={{{{ opacity: 1, y: 0 }}}}
                transition={{{{ duration: 0.5, delay: 0.9 }}}}
                className="flex items-center gap-4 my-2"
              >
                <hr className="flex-1 border-white/10" />
                <span className="text-xs text-[#666] uppercase font-semibold tracking-wider font-['Epilogue']">or continue with email</span>
                <hr className="flex-1 border-white/10" />
              </motion.div>
"""
    # Insert right before the form starts (after the error displays)
    content = content.replace('<AnimatePresence mode="wait">', google_html + '\n              <AnimatePresence mode="wait">')

    # Add states and handlers
    content = content.replace('const [loading, setLoading] = useState(false);', 'const [loading, setLoading] = useState(false);\n  const [googleLoading, setGoogleLoading] = useState(false);')
    
    # Update useAuth to include signInWithGoogle
    content = content.replace('const { login, currentUser, loading: authLoading, resetPassword } = useAuth();', 'const { login, currentUser, loading: authLoading, resetPassword, signInWithGoogle } = useAuth();')
    content = content.replace('const { register, currentUser, loading: authLoading } = useAuth();', 'const { register, currentUser, loading: authLoading, signInWithGoogle } = useAuth();')

    # Add handler function
    handler = """
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
"""
    content = content.replace('const handleSubmit = useCallback(async (e: React.FormEvent) => {', handler + '\n  const handleSubmit = useCallback(async (e: React.FormEvent) => {')

    with open(filepath, 'w') as f:
        f.write(content)

try:
    update_auth_context()
    print("Updated AuthContext")
except Exception as e:
    print(f"Error updating AuthContext: {e}")

try:
    remove_icons('src/pages/Login.tsx')
    add_google_button('src/pages/Login.tsx', False)
    print("Updated Login.tsx")
except Exception as e:
    print(f"Error updating Login.tsx: {e}")

try:
    remove_icons('src/pages/Register.tsx')
    add_google_button('src/pages/Register.tsx', True)
    print("Updated Register.tsx")
except Exception as e:
    print(f"Error updating Register.tsx: {e}")
