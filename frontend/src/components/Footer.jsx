import { Heart, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800/80 pt-16 pb-8 mt-auto font-tech relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/30 to-transparent"></div>
      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <ImageIcon size={24} className="text-sky-500" />
              <span className="font-extrabold text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500">
                BYTE.SQUISH_
              </span>
            </Link>
            <p className="text-zinc-500 text-xs max-w-sm leading-relaxed font-mono">
              // HIGH-PERFORMANCE IMAGE OPTIMIZATION ALGORITHMS. <br/>
              REDUCE PAYLOAD SIZE. RETAIN VISUAL FIDELITY.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-zinc-300 mb-4 font-mono tracking-widest text-xs uppercase border-b border-zinc-800/80 pb-2">Navigation</h4>
            <ul className="space-y-2 text-xs font-mono text-zinc-500 tracking-widest">
              <li><Link to="/" className="hover:text-sky-400 hover:tracking-[0.2em] transition-all">./HOME</Link></li>
              <li><Link to="/login" className="hover:text-sky-400 hover:tracking-[0.2em] transition-all">./AUTH/LOGIN</Link></li>
              <li><Link to="/register" className="hover:text-sky-400 hover:tracking-[0.2em] transition-all">./AUTH/REGISTER</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-zinc-300 mb-4 font-mono tracking-widest text-xs uppercase border-b border-zinc-800/80 pb-2">Legal</h4>
            <ul className="space-y-2 text-xs font-mono text-zinc-500 tracking-widest">
              <li><Link to="/privacy-policy" className="hover:text-sky-400 hover:tracking-[0.2em] transition-all">./PRIVACY_POLICY</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-sky-400 hover:tracking-[0.2em] transition-all">./TERMS_CONDITIONS</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800/80 pt-8 flex flex-col md:flex-row items-center justify-between text-[10px] font-mono text-zinc-600 tracking-widest">
          <p>© {new Date().getFullYear()} BYTESQUISH SYSTEM. ALL RIGHTS RESERVED.</p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            ENGINEERED WITH <Heart size={10} className="text-red-500 animate-pulse" /> BY <a href="https://isharankumar.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-400 transition-colors underline decoration-dotted underline-offset-4 ml-1">SHARAN KUMAR</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
