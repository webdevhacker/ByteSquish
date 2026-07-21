import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Image as ImageIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="fixed top-0 inset-x-0 z-50 pt-4 flex justify-center w-full pointer-events-none">
      <header className="pointer-events-auto backdrop-blur-2xl bg-white/60 dark:bg-zinc-900/60 border border-gray-200/50 dark:border-zinc-800/50 transition-colors duration-300 rounded-2xl shadow-xl shadow-black/5 dark:shadow-sky-900/10 w-[95%] max-w-6xl">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <ImageIcon size={18} strokeWidth={2.5} className="sm:hidden" />
              <ImageIcon size={22} strokeWidth={2.5} className="hidden sm:block" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-br from-sky-600 to-purple-500 dark:from-sky-400 dark:to-purple-300 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              ByteSquish
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                {user.isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-tech text-purple-500 bg-purple-500/10 px-2 sm:px-3 py-1.5 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="hidden sm:inline">[ ADMIN ]</span>
                    <span className="sm:hidden">[ ADM ]</span>
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-tech text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 px-2 sm:px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-zinc-700 transition-colors">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="hidden sm:inline">[ PROFILE ]</span>
                  <span className="sm:hidden">[ PROF ]</span>
                </Link>
                <button 
                  onClick={logout}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors text-xs sm:text-sm font-medium border border-transparent dark:border-zinc-700"
                >
                  <LogOut size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/login" className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.6)]">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
