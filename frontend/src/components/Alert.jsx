import { AlertCircle, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function Alert({ type = 'error', message, className = '' }) {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';
  const isWarning = type === 'warning';

  const baseClasses = "relative overflow-hidden p-4 rounded-xl flex items-start gap-3 z-10 font-mono text-xs tracking-widest uppercase shadow-lg border backdrop-blur-xl transition-all duration-300 animate-fade-in-up";
  
  const typeClasses = {
    error: "bg-red-950/40 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]",
    success: "bg-emerald-950/40 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    warning: "bg-yellow-950/40 border-yellow-500/50 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.15)]",
  };

  const Icon = isError ? ShieldAlert : isSuccess ? CheckCircle : AlertTriangle;
  const prefix = isError ? "SYS_ERR" : isSuccess ? "SYS_ACK" : "SYS_WARN";

  return (
    <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
      {/* Animated scanline */}
      <div className={`absolute top-0 left-0 w-full h-[1px] opacity-50 animate-scan ${isError ? 'bg-red-500' : isSuccess ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
      
      <div className="relative shrink-0 mt-0.5">
        <Icon size={18} className={isError ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : isSuccess ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]'} />
      </div>
      
      <div className="flex-1">
        <span className={`font-bold mr-2 opacity-80 ${isError ? 'text-red-500' : isSuccess ? 'text-emerald-500' : 'text-yellow-500'}`}>
          [{prefix}]:
        </span>
        <span className="leading-relaxed">{message}</span>
      </div>
    </div>
  );
}
