import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

const PermissionWarning: React.FC = () => {
  return (
    <div className="mx-6 mt-4 p-4 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 shadow-sm">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-orange-800 dark:text-orange-400">Database Permissions Required</h4>
          <p className="text-xs text-orange-700 dark:text-orange-300/80 mt-1 leading-relaxed">
            Your Firestore Security Rules are currently blocking data access. To fix this, go to your Firebase Console and update your rules to:
          </p>
          <div className="mt-3 p-3 rounded-xl bg-white dark:bg-black/40 font-mono text-[10px] text-slate-600 dark:text-slate-400 border border-orange-100 dark:border-orange-500/10 overflow-x-auto whitespace-pre">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <a 
              href="https://console.firebase.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
            >
              <span>Open Firebase Console</span>
              <ExternalLink size={12} />
            </a>
            <span className="text-[10px] text-orange-400">•</span>
            <span className="text-[10px] text-orange-500 font-medium italic">App is running in local fallback mode</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionWarning;
