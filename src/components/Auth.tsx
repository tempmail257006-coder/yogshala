import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Flower2, ChevronLeft } from 'lucide-react';
import { GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { auth, googleProvider } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LANGUAGE_STORAGE_KEY, PENDING_NAME_STORAGE_KEY } from '../lib/i18n';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

const resolveAuthErrorMessage = (
  err: unknown,
  options: { isForgotPassword: boolean; language: 'en' | 'ta' }
) => {
  const rawMessage = String((err as any)?.message || 'Authentication failed.');
  const code = String((err as any)?.code || '').toLowerCase();
  const text = `${code} ${rawMessage}`.toLowerCase();
  const isTamil = options.language === 'ta';

  if (text.includes('auth/invalid-credential') || text.includes('auth/wrong-password') || text.includes('auth/user-not-found')) {
    return isTamil
      ? 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். சரிபார்த்து மீண்டும் முயற்சிக்கவும்.'
      : 'Invalid email or password. Please check and try again.';
  }
  if (text.includes('auth/invalid-email')) {
    return isTamil ? 'தவறான மின்னஞ்சல் முகவரி.' : 'Invalid email address format.';
  }
  if (text.includes('auth/user-disabled')) {
    return isTamil ? 'இந்த கணக்கு முடக்கப்பட்டுள்ளது.' : 'This account has been disabled.';
  }
  if (text.includes('auth/too-many-requests')) {
    return isTamil
      ? 'மிகவும் அதிக முயற்சிகள். சில நிமிடம் கழித்து மீண்டும் முயற்சிக்கவும்.'
      : 'Too many attempts. Please wait and try again.';
  }
  if (text.includes('auth/email-already-in-use')) {
    return isTamil
      ? 'இந்த மின்னஞ்சல் ஏற்கனவே பயன்படுத்தப்பட்டுள்ளது.'
      : 'This email is already in use. Try signing in.';
  }
  if (text.includes('auth/weak-password')) {
    return isTamil
      ? 'பலவீனமான கடவுச்சொல். குறைந்தது 6 எழுத்துகள் வேண்டும்.'
      : 'Weak password. Use at least 6 characters.';
  }
  if (options.isForgotPassword && text.includes('auth/missing-email')) {
    return isTamil ? 'கடவுச்சொல் மீட்டமைக்க மின்னஞ்சல் தேவை.' : 'Email is required to reset password.';
  }

  return rawMessage;
};

const Auth: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        throw new Error(language === 'ta' ? 'மின்னஞ்சல் முகவரி தேவை.' : 'Email is required.');
      }
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      if (!isLogin && !isForgotPassword) {
        window.localStorage.setItem(PENDING_NAME_STORAGE_KEY, name.trim());
      }
      const authInstance = auth;
      if (!authInstance) {
        throw new Error('Firebase is not configured. Please set your Firebase keys.');
      }
      if (isForgotPassword) {
        await sendPasswordResetEmail(authInstance, normalizedEmail);
        setSuccess(language === 'ta' ? 'கடவுச்சொல் மீட்டமைப்பு மின்னஞ்சல் அனுப்பப்பட்டது. உங்கள் இன்பாக்ஸை பாருங்கள்.' : 'Password reset email sent! Check your inbox.');
        setIsForgotPassword(false);
      } else if (isLogin) {
        await signInWithEmailAndPassword(authInstance, normalizedEmail, password);
      } else {
        if (password !== confirmPassword) {
          throw new Error("Passwords don't match");
        }
        await createUserWithEmailAndPassword(authInstance, normalizedEmail, password);
      }
    } catch (err: any) {
      setError(resolveAuthErrorMessage(err, { isForgotPassword, language }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      if (!auth) {
        throw new Error('Firebase is not configured. Please set your Firebase keys.');
      }
      if (Capacitor.isNativePlatform()) {
        const signInNative = (useCredentialManager: boolean) =>
          FirebaseAuthentication.signInWithGoogle({
            skipNativeAuth: true,
            useCredentialManager,
          });

        let result;
        try {
          // Some Android devices return "No credentials available" with Credential Manager.
          // Fall back to the legacy flow in that case.
          result = await signInNative(true);
        } catch (firstErr: any) {
          const message = String(firstErr?.message || '').toLowerCase();
          if (message.includes('no credentials') || message.includes('credential')) {
            result = await signInNative(false);
          } else {
            throw firstErr;
          }
        }

        const idToken = result.credential?.idToken;
        const accessToken = result.credential?.accessToken;
        if (!idToken) {
          throw new Error('Google sign-in failed to return an ID token.');
        }
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        await signInWithCredential(auth, credential);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (err: any) {
      const raw = err?.message || 'Google sign-in failed.';
      const lower = String(raw).toLowerCase();
      if (lower.includes('no credentials')) {
        setError('No Google account found on this device. Please add a Google account and try again.');
      } else if (lower.includes('developer_error') || lower.startsWith('10')) {
        setError('Google Sign-In setup error (code 10). Please add the SHA-1/SHA-256 of your app to Firebase and re-download google-services.json.');
      } else if (lower.includes('auth/invalid-credential')) {
        setError('Google credential is invalid for this Firebase project. Verify Google Sign-In is enabled in Firebase and app SHA fingerprints are configured.');
      } else {
        setError(raw);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 px-0 sm:px-4 lg:px-6 flex flex-col items-center justify-center">
      <div className="mobile-container bg-soft-gradient shadow-2xl overflow-hidden flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-12">
        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-deep-purple/10 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 -right-40 w-[700px] h-[700px] bg-ocean-blue/10 rounded-full blur-[140px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-auto w-full max-w-xl space-y-8 sm:space-y-10"
        >
          <header className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/language')}
              className="inline-flex items-center gap-2 text-small-label text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={16} />
              <span>{language === 'ta' ? 'மொழிக்கு திரும்பு' : 'Back to language'}</span>
            </button>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[24px] bg-animated-gradient flex items-center justify-center text-white shadow-2xl shadow-deep-purple/20 mb-6 overflow-hidden">
              {!isForgotPassword ? (
                <img 
                  src="images/yogshala-logo.png"
                  alt="YOGSHALA"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Flower2 size={32} />
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-tight">
              {isForgotPassword ? t('resetPassword', language) : isLogin ? t('welcomeBack', language) : t('joinYogshala', language)}
            </h2>
            <p className="text-body text-gray-500 max-w-md">
              {isForgotPassword 
                ? (language === 'ta' ? 'பாதுகாப்பான மீட்டமைப்பு இணைப்பைப் பெற உங்கள் மின்னஞ்சலை உள்ளிடவும்' : 'Enter your email to receive a secure reset link') 
                : isLogin 
                  ? (language === 'ta' ? 'உங்கள் மனஅமைதி பயணத்தை தொடர உள்நுழையவும்' : 'Sign in to continue your mindful journey') 
                  : (language === 'ta' ? 'உங்கள் தனிப்பயன் ஏஐ நல அனுபவத்தை இன்று தொடங்குங்கள்' : 'Start your personalized AI wellness experience today')}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {success && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-emerald-600 text-sm font-bold px-4 py-3 bg-emerald-50 rounded-2xl border border-emerald-100"
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>
            
            {!isLogin && !isForgotPassword && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder={t('fullName', language)}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 glass-card bg-white/40 border-white/60 outline-none focus:ring-2 focus:ring-deep-purple transition-all shadow-sm"
                  required
                />
              </motion.div>
            )}

            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                placeholder={t('emailAddress', language)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-14 pr-6 py-5 glass-card bg-white/40 border-white/60 outline-none focus:ring-2 focus:ring-deep-purple transition-all shadow-sm"
                required
              />
            </div>

            {!isForgotPassword && (
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder={t('password', language)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 glass-card bg-white/40 border-white/60 outline-none focus:ring-2 focus:ring-deep-purple transition-all shadow-sm"
                  required
                />
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative"
              >
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder={t('confirmPassword', language)}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 glass-card bg-white/40 border-white/60 outline-none focus:ring-2 focus:ring-deep-purple transition-all shadow-sm"
                  required
                />
              </motion.div>
            )}

            {isLogin && !isForgotPassword && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-xs text-deep-purple font-bold hover:underline tracking-wide uppercase"
                >
                  {t('forgotPassword', language)}
                </button>
              </div>
            )}

            {error && <p className="text-red-500 text-sm font-bold px-2">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-deep-purple text-white rounded-[24px] font-bold shadow-2xl shadow-deep-purple/20 flex items-center justify-center space-x-3 transition-all disabled:opacity-50"
            >
              <span className="text-lg">{isForgotPassword ? t('sendResetLink', language) : isLogin ? t('signIn', language) : t('signUp', language)}</span>
              <ArrowRight size={20} />
            </motion.button>

            {isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full py-2 text-gray-500 text-sm font-bold hover:text-deep-purple transition-colors uppercase tracking-widest"
              >
                {t('backToSignIn', language)}
              </button>
            )}
          </form>

          <div className="space-y-8">
            <div className="flex items-center w-full space-x-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">{t('orContinueWith', language)}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                className="w-full py-5 glass-card bg-white/60 border-white/80 rounded-[24px] flex items-center justify-center space-x-4 shadow-sm hover:bg-white transition-all"
              >
                <GoogleIcon />
                <span className="font-bold text-gray-800 text-lg">Google</span>
              </motion.button>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-deep-purple font-bold hover:underline text-lg"
              >
                {isLogin ? t('noAccount', language) : t('haveAccount', language)}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
