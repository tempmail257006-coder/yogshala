import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import SplashScreen from './components/SplashScreen';
import Auth from './components/Auth';
import LanguageSelection from './components/LanguageSelection';
import AppLayout from './components/AppLayout';
import Home from './components/Home';
import Workspace from './components/Workspace';
import AIChat from './components/AIChat';
import History from './components/History';
import Profile from './components/Profile';
import Challenges from './components/Challenges';
import GuidedSession from './components/GuidedSession';
import YOGSHALALevels from './components/YOGSHALALevels';
import YOGSHALALevelDetail from './components/YOGSHALALevelDetail';
import YOGSHALAPoseDetail from './components/YOGSHALAPoseDetail';
import PrivacyPolicy from './components/PrivacyPolicy';
import DeleteAccount from './components/DeleteAccount';
import BeginnerPracticeTypes from './components/BeginnerPracticeTypes';
import BeginnerPracticeVideos from './components/BeginnerPracticeVideos';
import BeginnerPracticeItemDetail from './components/BeginnerPracticeItemDetail';
import { useState } from 'react';

const AppContent: React.FC = () => {
  const { user, loading, isConfigured } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (loading) {
    return null; // Or a small loading spinner if needed
  }

  if (!isConfigured && !user) {
    return (
      <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center">
        <div className="mobile-container flex flex-col items-center justify-center p-6 text-center bg-white shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Configuration Required</h2>
          <p className="text-slate-500 mb-8">
            Please set your Firebase API keys in the environment variables to enable authentication and data storage.
          </p>
          <div className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs font-mono overflow-x-auto">
            <p className="text-slate-400 mb-2"># Required Variables:</p>
            <p className="text-deep-purple">VITE_FIREBASE_API_KEY</p>
            <p className="text-deep-purple">VITE_FIREBASE_AUTH_DOMAIN</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        {!user ? (
          <>
            <Route path="/language" element={<LanguageSelection />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/language" replace />} />
          </>
        ) : (
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/practice/beginner" element={<BeginnerPracticeTypes />} />
            <Route path="/practice/beginner/:styleId" element={<BeginnerPracticeVideos />} />
            <Route path="/practice/beginner/:styleId/:itemId" element={<BeginnerPracticeItemDetail />} />
            <Route path="/practice/beginner/*" element={<Navigate to="/practice/beginner" replace />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/guided" element={<GuidedSession />} />
            <Route path="/levels" element={<YOGSHALALevels />} />
            <Route path="/levels/:levelId" element={<YOGSHALALevelDetail />} />
            <Route path="/levels/:levelId/pose/:poseId" element={<YOGSHALAPoseDetail />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </HashRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}
