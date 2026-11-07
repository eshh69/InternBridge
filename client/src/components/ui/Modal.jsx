import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-2xl',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#0D1C16]/65 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden transform transition-all animate-scale-in border border-[#C8B48A]/40`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-gray-100 bg-[#FAF7F0]/80">
          <h3 id="modal-title" className="text-base font-extrabold text-[#1E3B2F] tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-[#1E3B2F] hover:bg-[#7F8C6A]/15 rounded-lg p-1 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1E3B2F] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 max-h-[82vh] overflow-y-auto">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-3 bg-[#FAF7F0]/80 border-t border-gray-100">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
