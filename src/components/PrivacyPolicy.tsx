import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-deep-purple font-semibold">Privacy & Data</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">Privacy Policy – YOGSHALA</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-3xl px-5 py-3 bg-white text-gray-700 font-semibold shadow-lg shadow-slate-200 border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Back
          </button>
          <button
            onClick={() => (window.location.href = 'mailto:srecminiproject07@gmail.com')}
            className="rounded-3xl px-5 py-3 bg-deep-purple text-white font-semibold shadow-lg shadow-deep-purple/20 hover:bg-deep-purple/90 transition-all"
          >
            Contact Support
          </button>
          <button
            onClick={() => navigate('/delete-account')}
            className="rounded-3xl px-5 py-3 bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all"
          >
            Delete My Account
          </button>
        </div>
      </div>

      <div className="glass-card p-6 md:p-8 space-y-6 border border-white/60 shadow-2xl bg-white/80">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">YOGASHALA and your privacy</h2>
          <p className="text-base leading-8 text-slate-600">
            YOGASHALA values user privacy and protects personal information. When users create an account,
            sign in with Google, or use the app, YOGASHALA may collect basic account information such as name,
            email address, and authentication details through Firebase Authentication.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Camera use for posture detection</h3>
          <p className="text-base leading-8 text-slate-600">
            If users access yoga posture detection features, camera access may be used only for real-time pose analysis.
            The app does not store camera video or images without explicit user permission.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Stored app data</h3>
          <p className="text-base leading-8 text-slate-600">
            YOGASHALA may store yoga progress, session history, and wellness activity to improve personalized recommendations
            and enhance the user experience.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Data sharing and security</h3>
          <p className="text-base leading-8 text-slate-600">
            YOGASHALA does not sell personal user data to third parties. Data is securely managed using trusted services such as Firebase.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Account deletion</h3>
          <p className="text-base leading-8 text-slate-600">
            Users may request account deletion at any time through the Delete Account option inside the app.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-3">Support</p>
          <p className="text-base text-slate-700">For privacy concerns or support, contact us at the email below.</p>
          <a className="mt-4 inline-block text-deep-purple font-semibold" href="mailto:srecminiproject07@gmail.com">
            srecminiproject07@gmail.com
          </a>
        </div>
        <div className="glass-card p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-3">Data policy</p>
          <p className="text-base text-slate-700">Your name, email, login, and wellness activity are kept private and used only to personalize YOGASHALA.</p>
        </div>
        <div className="glass-card p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-3">Account control</p>
          <p className="text-base text-slate-700">Delete your account any time. We keep your experience secure and transparent.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
