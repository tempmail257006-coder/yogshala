import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser, signOut } from 'firebase/auth';
import { deleteDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const DeleteAccount: React.FC = () => {
  const navigate = useNavigate();
  const { user, isDemoMode, setDemoMode } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = () => {
    navigate('/profile');
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      if (isDemoMode || user?.uid === 'demo-user') {
        setDemoMode(false);
        navigate('/auth');
        return;
      }

      if (!auth?.currentUser || !user) {
        setError('Unable to verify your account. Please sign in again and try again.');
        return;
      }

      if (db) {
        const profileDoc = doc(db, 'users', user.uid);
        await deleteDoc(profileDoc);

        const historyQuery = query(collection(db, 'history'), where('userId', '==', user.uid));
        const historySnapshot = await getDocs(historyQuery);
        await Promise.all(historySnapshot.docs.map((historyDoc) => deleteDoc(historyDoc.ref)));
      }

      await deleteUser(auth.currentUser);
      await signOut(auth);
      navigate('/auth');
    } catch (err: any) {
      console.error('Account deletion failed', err);
      if (err?.code === 'auth/requires-recent-login') {
        setError('Recent authentication is required. Please sign in again before deleting your account.');
      } else {
        setError('Failed to delete your account. Please try again later.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-red-600 font-semibold">Account Safety</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Delete My Account</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCancel}
            className="rounded-3xl px-5 py-3 bg-white text-gray-700 font-semibold shadow-lg shadow-slate-200 border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-3xl px-5 py-3 bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all"
          >
            Confirm Delete Account
          </button>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 space-y-6 bg-white/90 border border-white/70 shadow-2xl">
        <p className="text-base leading-8 text-slate-600">
          Users can permanently delete their YOGASHALA account and associated personal data.
        </p>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">What will happen when you delete your account</h2>
          <ul className="space-y-3 list-disc list-inside text-slate-600">
            <li>Login credentials will be removed.</li>
            <li>Stored profile information will be deleted.</li>
            <li>Yoga progress/history may be removed.</li>
            <li>Access to personalized recommendations will end.</li>
          </ul>
        </div>

        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200">
          <p className="font-semibold text-amber-900">Warning</p>
          <p className="mt-2 text-slate-600">This action cannot be undone. Please confirm carefully before deleting your account.</p>
        </div>

        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <div className="glass-card w-full max-w-xl rounded-[32px] border border-white/70 bg-white/95 p-6 shadow-2xl">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-red-600 font-semibold">Confirm Deletion</p>
                <h2 className="text-2xl font-bold text-slate-900">Are you sure?</h2>
              </div>
              <p className="text-slate-600 leading-7">
                Deleting your account will remove your profile and the associated personal data stored by YOGASHALA. This cannot be undone.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="rounded-3xl px-5 py-3 bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-all"
                >
                  No, keep my account
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-3xl px-5 py-3 bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all disabled:opacity-60"
                >
                  {isDeleting ? 'Deleting account...' : 'Yes, delete my account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;
