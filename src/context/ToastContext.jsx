import { createContext, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const show = (mensagem, tipo = 'sucesso') => {
    clearTimeout(timer.current);
    setToast({ mensagem, tipo, key: Date.now() });
    timer.current = setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div key={toast.key} className={`toast toast-${toast.tipo}`} role="status" data-testid="toast">
          {toast.mensagem}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
