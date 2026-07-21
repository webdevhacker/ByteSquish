import { Heart, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white/50 dark:bg-zinc-950/80 backdrop-blur-md border-t border-gray-200/50 dark:border-zinc-800/80 pt-16 pb-8 mt-auto font-tech">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <ImageIcon size={24} className="text-sky-500" />
              <span className="font-extrabold text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500">
                BYTE.SQUISH_
              </span>
            </Link>
            <p className="text-gray-500 dark:text-zinc-500 text-sm max-w-sm leading-relaxed">
              // High-performance image optimization algorithms. <br/>
              Reduce payload size. Retain visual fidelity.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-zinc-300 mb-4 tracking-widest text-sm uppercase">Navigation</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-zinc-500">
              <li><Link to="/" className="hover:text-sky-500 transition-colors">./home</Link></li>
              <li><Link to="/login" className="hover:text-sky-500 transition-colors">./auth/login</Link></li>
              <li><Link to="/register" className="hover:text-sky-500 transition-colors">./auth/register</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-zinc-300 mb-4 tracking-widest text-sm uppercase">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-zinc-500">
              <li><Link to="/privacy-policy" className="hover:text-sky-500 transition-colors">./privacy_policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-sky-500 transition-colors">./terms_conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200/50 dark:border-zinc-800/80 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 dark:text-zinc-600">
          <p>© {new Date().getFullYear()} BYTESQUISH SYSTEM. ALL RIGHTS RESERVED.</p>
          <p className="flex items-center gap-1 mt-2 md:mt-0">
            ENGINEERED WITH <Heart size={12} className="text-red-500 animate-pulse" /> BY <a href="https://isharankumar.com" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition-colors underline decoration-dotted underline-offset-4 ml-1">SHARAN KUMAR</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
