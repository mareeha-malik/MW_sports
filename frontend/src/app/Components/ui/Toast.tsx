'use client';

import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleClose = () => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    };

    const timer = setTimeout(handleClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: {
      bg: 'bg-green-900/90',
      border: 'border-green-700',
      text: 'text-green-100',
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    },
    error: {
      bg: 'bg-red-900/90',
      border: 'border-red-700',
      text: 'text-red-100',
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
    },
    warning: {
      bg: 'bg-yellow-900/90',
      border: 'border-yellow-700',
      text: 'text-yellow-100',
      icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    },
    info: {
      bg: 'bg-blue-900/90',
      border: 'border-blue-700',
      text: 'text-blue-100',
      icon: <Info className="w-5 h-5 text-blue-400" />,
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`
        pointer-events-auto transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div
        className={`
          ${style.bg} ${style.border} ${style.text}
          border rounded-lg px-4 py-3 flex items-start gap-3 backdrop-blur-md
          shadow-lg shadow-black/30 max-w-sm
        `}
      >
        <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
        <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
