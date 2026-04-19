import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Flower2, ChevronLeft } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { LANGUAGE_STORAGE_KEY, PENDING_NAME_STORAGE_KEY } from '../lib/i18n';

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
