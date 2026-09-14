import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FinalCompletionCardBack } from './FinalCompletionCardBack';

export interface FinalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Standalone Independent Final Certificate Modal.
 * Awarded exclusively upon completing all required gallery puzzles.
 * Completely independent of Star points, Star modals, and Star progression.
 */
export const FinalCertificateModal: React.FC<FinalCertificateModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        id="final-certificate-modal-backdrop"
        className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-[#0e0f0f]/60 backdrop-blur-xs select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          id="final-certificate-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 14 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md max-h-[92vh] flex flex-col"
        >
          <FinalCompletionCardBack
            onClose={onClose}
            isFlipped={true}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FinalCertificateModal;
