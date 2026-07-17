'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, mode = 'login' }: AuthModalProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>(mode);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { login, signup, googleLogin, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (authMode === 'login') {
        if (!email || !password) {
          toast.error('Please fill in all fields');
          return;
        }
        await login(email, password, isAdminLogin);
        toast.success(isAdminLogin ? 'Admin Access Granted!' : 'Login successful!');
      } else {
        if (!name || !email || !password) {
          toast.error('Please fill in all fields');
          return;
        }
        await signup(name, email, password);
        toast.success('Account created successfully!');
      }
      onClose();
      setEmail('');
      setPassword('');
      setName('');
      setIsAdminLogin(false);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md p-8 animate-slide-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold gradient-text-glow">
            {authMode === 'login' ? (isAdminLogin ? 'Admin Portal' : 'Welcome Back') : 'Create Account'}
          </h2>
          <button
            onClick={() => {
              onClose();
              setIsAdminLogin(false);
            }}
            className="p-2 hover:bg-cyan-500/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {authMode === 'login' && (
          <div className="flex gap-2 p-1 bg-slate-950/60 rounded-xl border border-cyan-500/10 mb-6">
            <button
              type="button"
              onClick={() => setIsAdminLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                !isAdminLogin
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setIsAdminLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                isAdminLogin
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin Login
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-5 h-5 text-cyan-400/60" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/50 border border-cyan-500/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-cyan-400/60" />
            <input
              type="email"
              placeholder={isAdminLogin ? "Admin Email (e.g. admin@toyshop.com)" : "Email Address"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/50 border border-cyan-500/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-5 h-5 text-cyan-400/60" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-cyan-500/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/60 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              isAdminLogin && authMode === 'login'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30'
                : 'btn-futuristic'
            }`}
          >
            {isLoading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {(authMode === 'login' || authMode === 'register') && (
          <>
            <div className="mt-6 flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-600/50"></div>
              <span className="text-sm text-slate-400">Or</span>
              <div className="flex-1 h-px bg-slate-600/50"></div>
            </div>

            {isAdminLogin && authMode === 'login' && (
              <p className="mt-3 text-sm text-slate-400">
                If this admin email was created through Google, please use the Google button below instead of entering a password.
              </p>
            )}

            <button
              type="button"
              onClick={async () => {
                try {
                  await googleLogin();
                  toast.success('Redirecting to Google sign in...');
                } catch (error: any) {
                  toast.error(error.message || 'Google sign in failed.');
                }
              }}
              className="w-full mt-4 py-3 rounded-lg border border-cyan-500/30 text-slate-200 bg-slate-900 hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Continue with Google
            </button>

            <button
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'register' : 'login');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="w-full mt-4 py-3 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors font-medium"
            >
              {authMode === 'login' ? 'Create New Account' : 'Already have an account?'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
