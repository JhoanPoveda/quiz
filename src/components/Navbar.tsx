import React from 'react';
import { User } from 'firebase/auth';
import { CheckCircle2, FileSpreadsheet, FormInput, HardDrive, LogOut, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout, isLoggingIn }) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo & App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-sky-200">
            <span className="text-xl font-black tracking-tighter">CZ</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-slate-900 text-lg tracking-tight">
                Czech Quiz Creator
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
                Forms + Sheets
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Evaluación czech con distractores gramaticales para Google Forms & Sheets
            </p>
          </div>
        </div>

        {/* Workspace Connection & Auth */}
        <div className="flex items-center space-x-4">
          {/* Workspace Badges */}
          <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600">
            <span className="flex items-center space-x-1">
              <FormInput className="w-3.5 h-3.5 text-purple-600" />
              <span>Forms</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center space-x-1">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sheets</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center space-x-1">
              <HardDrive className="w-3.5 h-3.5 text-blue-600" />
              <span>Drive</span>
            </span>
          </div>

          {user ? (
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-full pl-2 pr-3 py-1">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/30"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.displayName || 'Google User'}
                </span>
                <span className="text-[11px] text-slate-500 max-w-[150px] truncate leading-tight">
                  {user.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-slate-200/70 transition-colors cursor-pointer ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center px-4 py-2 border border-slate-300 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              <span>{isLoggingIn ? 'Conectando...' : 'Conectar con Google'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
