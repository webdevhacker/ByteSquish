import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Alert from '../components/Alert';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map(toast => {
      if (toast.duration !== Infinity) {
        return setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration);
      }
      return null;
    });

    return () => {
      timers.forEach(t => t && clearTimeout(t));
    };
  }, [toasts]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0 sm:bottom-6 sm:right-6">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Alert 
              type={toast.type} 
              message={toast.message} 
              className="shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-zinc-700 w-full"
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
