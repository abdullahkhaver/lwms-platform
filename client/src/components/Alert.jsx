import { FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';

export const Alert = ({ type = 'error', message, onClose, autoClose = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoClose) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [autoClose, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'error' ? 'bg-red-50' : 'bg-green-50';
  const borderColor = type === 'error' ? 'border-red-200' : 'border-green-200';
  const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';
  const iconColor = type === 'error' ? 'text-red-500' : 'text-green-500';
  const Icon = type === 'error' ? FiAlertCircle : FiCheckCircle;

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 flex items-start space-x-3`}>
      <Icon className={`${iconColor} flex-shrink-0 mt-0.5`} size={20} />
      <div className="flex-1">
        <p className={`${textColor} text-sm font-medium`}>{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className={`${textColor} hover:opacity-70 transition`}
      >
        <FiX size={18} />
      </button>
    </div>
  );
};
