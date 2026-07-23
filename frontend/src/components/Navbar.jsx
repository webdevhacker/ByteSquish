import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Image as ImageIcon } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="fixed top-0 inset-x-0 z-50 pt-4 flex justify-center w-full pointer-events-none font-tech">
      <header className="pointer-events-auto backdrop-blur-xl bg-zinc-950/70 border border-zinc-800/80 transition-colors duration-300 rounded-2xl shadow-[0_5px_30px_rgba(56,189,248,0.1)] w-[95%] max-w-6xl relative overflow-hidden group">
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent"></div>
        <div className="absolute bottom-0 w-full h-[1px] bg-zinc-800"></div>
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <ImageIcon size={24} className="text-sky-500 group-hover:scale-110 transition-transform duration-300" />
            <span className="font-extrabold text-lg sm:text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500 group-hover:opacity-80 transition-opacity">
              BYTE.SQUISH_
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            {user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                {user.isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-purple-400 bg-purple-950/30 px-2 sm:px-3 py-1.5 rounded-lg border border-purple-500/30 hover:bg-purple-900/50 hover:shadow-[0_0_10px_rgba(168,85,247,0.3)] transition-all">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_5px_rgba(168,85,247,0.8)]"></span>
                    <span className="hidden sm:inline">ROOT_ACCESS</span>
                    <span className="sm:hidden">ROOT</span>
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-emerald-400 bg-emerald-950/30 px-2 sm:px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:bg-emerald-900/50 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                  <span className="hidden sm:inline">USER_NODE</span>
                  <span className="sm:hidden">NODE</span>
                </Link>
                <button 
                  onClick={logout}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-red-950/20 hover:bg-red-900/40 text-red-400 font-mono tracking-widest text-[10px] sm:text-xs border border-red-900/50 hover:border-red-500/50 hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-all"
                >
                  <LogOut size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">DISCONNECT</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link to="/login" className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-sky-400 hover:text-sky-300 border border-sky-900/50 rounded-lg hover:border-sky-500/50 hover:bg-sky-950/30 transition-all">
                  LOGIN
                </Link>
                <Link to="/register" className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-mono font-bold tracking-widest bg-sky-600/20 border border-sky-500/50 hover:bg-sky-600/40 text-sky-400 rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.2)] transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.4)]">
                  INITIALIZE
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  );
}
