import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Mail, Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { triggerHaptic } from '../../lib/haptics';

export const AuthModal: React.FC = () => {
  const isAuthModalOpen = useAuthStore((state) => state.isAuthModalOpen);
  const closeAuthModal = useAuthStore((state) => state.closeAuthModal);
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
  const signInWithEmail = useAuthStore((state) => state.signInWithEmail);
  const signUpWithEmail = useAuthStore((state) => state.signUpWithEmail);
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);
  const isLoading = useAuthStore((state) => state.isLoading);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    clearAuthError();

    if (mode === 'signin') {
      await signInWithEmail(email.trim(), password);
    } else {
      await signUpWithEmail(email.trim(), password, displayName.trim());
    }
  };

  const handleGoogleSignIn = async () => {
    triggerHaptic('medium');
    clearAuthError();
    await signInWithGoogle();
  };

  const handleGuestContinue = () => {
    triggerHaptic('light');
    loginAsGuest();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#05130d] border border-emerald-900/80 p-6 shadow-2xl"
        >
          {/* Close */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-[#091e14] border border-emerald-900/70 text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-emerald-950 border border-emerald-500/40 mb-3 shadow-lg shadow-emerald-950/60">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-black text-white">
              {mode === 'signin' ? 'Sign In to Couch Commander' : 'Create Commander Profile'}
            </h3>
            <p className="text-xs text-emerald-300/80 mt-1 max-w-xs mx-auto">
              Sync your personal viewing progress, collect badges, and compete with friends.
            </p>
          </div>

          {/* Error Alert */}
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-[#091e14] hover:bg-[#0e2a1d] border border-emerald-800/80 text-white font-bold text-xs transition-all active:scale-95 mb-4 shadow-md"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-emerald-950" />
            <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
              Or with email
            </span>
            <div className="flex-1 h-px bg-emerald-950" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-emerald-300/80 mb-1">
                  Commander Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#091e14] border border-emerald-900 text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500 shadow-inner"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-emerald-300/80 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander@example.com"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#091e14] border border-emerald-900 text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-emerald-300/80 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-emerald-600 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#091e14] border border-emerald-900 text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs shadow-lg shadow-emerald-500/25 transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-4 pt-3 border-t border-emerald-950/80 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                clearAuthError();
                setMode(mode === 'signin' ? 'signup' : 'signin');
              }}
              className="text-emerald-400 hover:underline font-semibold"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </button>

            <button
              type="button"
              onClick={handleGuestContinue}
              className="text-emerald-600 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guest Mode</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
