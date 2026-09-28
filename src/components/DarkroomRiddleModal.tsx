import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, AlertCircle, CheckCircle2, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPersianDigits } from '../services/content/mappers';
import {
  getDarkroomRiddleState,
  saveDarkroomRiddleSuccess,
  DarkroomDiscountRecord,
} from '../data/darkroomRiddleStore';

/**
 * Single source of truth for the Darkroom Riddle correct answer.
 */
export const DARKROOM_RIDDLE_CORRECT_ANSWER = '030660';

export interface DarkroomRiddleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DarkroomRiddleModal: React.FC<DarkroomRiddleModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [darkroomState, setDarkroomState] = useState<DarkroomDiscountRecord>(() =>
    getDarkroomRiddleState()
  );
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(() => darkroomState.isSolved);
  const [shake, setShake] = useState<boolean>(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus the first empty digit box when modal opens
  useEffect(() => {
    if (isOpen) {
      const current = getDarkroomRiddleState();
      setDarkroomState(current);
      setIsSuccess(current.isSolved);
      if (!current.isSolved) {
        const firstEmpty = digits.findIndex((d) => d === '');
        const targetIndex = firstEmpty === -1 ? 0 : firstEmpty;
        setTimeout(() => {
          inputRefs.current[targetIndex]?.focus();
        }, 150);
      }
    } else {
      // Reset temporary error on close
      setError(null);
      setShake(false);
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Normalizes both English and Persian numeric characters
  const normalizeDigit = (char: string): string => {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const pIdx = persianDigits.indexOf(char);
    if (pIdx !== -1) return String(pIdx);
    if (/^[0-9]$/.test(char)) return char;
    return '';
  };

  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const lastChar = val.slice(-1);
    const norm = normalizeDigit(lastChar);
    if (norm) {
      const newDigits = [...digits];
      newDigits[index] = norm;
      setDigits(newDigits);
      setError(null);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
      setError(null);
      return;
    }

    if (e.key === 'ArrowLeft') {
      if (index > 0) {
        e.preventDefault();
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (e.key === 'ArrowRight') {
      if (index < 5) {
        e.preventDefault();
        inputRefs.current[index + 1]?.focus();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      return;
    }

    const norm = normalizeDigit(e.key);
    if (norm) {
      e.preventDefault();
      const newDigits = [...digits];
      newDigits[index] = norm;
      setDigits(newDigits);
      setError(null);
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const chars = pasted.split('').map(normalizeDigit).filter((c) => c !== '');
    if (chars.length === 0) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6 && i < chars.length; i++) {
      newDigits[i] = chars[i];
    }
    setDigits(newDigits);
    setError(null);
    const nextIndex = Math.min(chars.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = () => {
    const entered = digits.join('');
    if (entered.length < 6 || digits.some((d) => d === '')) {
      setError('لطفاً همهٔ ۶ رقم را وارد کنید.');
      return;
    }

    if (entered === DARKROOM_RIDDLE_CORRECT_ANSWER) {
      const record = saveDarkroomRiddleSuccess();
      setDarkroomState(record);
      setIsSuccess(true);
      setError(null);
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe confetti fallback
      }
    } else {
      setError('عدد واردشده صحیح نیست! دوباره در تاریکخانه دقت کن.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const renderDigitBox = (index: number) => {
    const val = digits[index];
    const displayVal = val ? toPersianDigits(val) : '';

    return (
      <input
        key={index}
        ref={(el) => {
          inputRefs.current[index] = el;
        }}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={1}
        value={displayVal}
        placeholder="۰"
        onPaste={handlePaste}
        onChange={(e) => handleInputChange(index, e)}
        onKeyDown={(e) => handleKeyDown(index, e)}
        onClick={() => inputRefs.current[index]?.select()}
        className="w-9 h-12 sm:w-11 sm:h-14 text-center text-xl sm:text-2xl font-black font-sans-custom text-[#1e1b18] bg-[#fefce8] border-2 border-[#1e1b18] rounded-xl shadow-[2px_2px_0px_#1e1b18] placeholder:text-stone-300 focus:bg-white focus:border-[#7c3aed] focus:shadow-[2.5px_2.5px_0px_#7c3aed] focus:outline-none transition-all"
        aria-label={`رقم ${toPersianDigits(index + 1)}`}
      />
    );
  };

  return (
    <AnimatePresence>
      <div
        id="darkroom-riddle-modal-backdrop"
        onClick={onClose}
        className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-[#0e0f0f]/60 backdrop-blur-xs select-none"
        dir="rtl"
      >
        <motion.div
          id="darkroom-riddle-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-2xl shadow-[6px_6px_0px_#1e1b18] overflow-hidden flex flex-col max-h-[88vh]"
        >
          {/* Top Header Bar */}
          <div
            id="darkroom-riddle-modal-header"
            className="bg-[#fef3c7] border-b-2 border-[#1e1b18] px-4 py-2.5 flex items-center justify-between shrink-0"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#fde68a] border-[1.5px] border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center text-[#1e1b18] shrink-0">
                <Gift className="w-3.5 h-3.5 text-[#b45309]" />
              </div>
              <h2
                id="darkroom-riddle-modal-title"
                className="font-sans-custom text-[13px] sm:text-[14px] font-black text-[#1e1b18] tracking-tight truncate"
              >
                معمای تاریکخانه
              </h2>
            </div>

            <button
              id="darkroom-riddle-close-btn"
              type="button"
              onClick={onClose}
              aria-label="بستن پنجره"
              className="w-7 h-7 rounded-full bg-[#ffffff] hover:bg-[#ef4444] hover:text-white transition-colors text-[#1e1b18] border border-[#1e1b18] shadow-[1px_1px_0px_#1e1b18] flex items-center justify-center cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-right">
            {!isSuccess ? (
              <>
                {/* Riddle Prompt Text */}
                <div className="space-y-2">
                  <p
                    id="darkroom-riddle-text"
                    className="font-sans-custom text-[14px] sm:text-[15px] font-black text-[#1e1b18] leading-relaxed"
                  >
                    یک عدد شش رقمی در این تاریکخانه مخفی شده؛ پیداش کن و هدیه رو دریافت کن.
                  </p>
                </div>

                {/* Six-Digit Timer-Style Input Layout: [ 0 ][ 0 ] : [ 0 ][ 0 ] : [ 0 ][ 0 ] */}
                <div className="py-2">
                  <div
                    dir="ltr"
                    className={`flex items-center justify-center gap-1.5 sm:gap-2.5 transition-transform ${
                      shake ? 'animate-bounce' : ''
                    }`}
                  >
                    {/* Pair 1 */}
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-[#f5f5f4] p-1.5 rounded-2xl border border-stone-300">
                      {renderDigitBox(0)}
                      {renderDigitBox(1)}
                    </div>

                    <span className="text-2xl sm:text-3xl font-black text-[#1e1b18] select-none font-mono pb-0.5">
                      :
                    </span>

                    {/* Pair 2 */}
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-[#f5f5f4] p-1.5 rounded-2xl border border-stone-300">
                      {renderDigitBox(2)}
                      {renderDigitBox(3)}
                    </div>

                    <span className="text-2xl sm:text-3xl font-black text-[#1e1b18] select-none font-mono pb-0.5">
                      :
                    </span>

                    {/* Pair 3 */}
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-[#f5f5f4] p-1.5 rounded-2xl border border-stone-300">
                      {renderDigitBox(4)}
                      {renderDigitBox(5)}
                    </div>
                  </div>
                </div>

                {/* Error Notice */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-[12px] font-black font-sans-custom"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Submit Action Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-3 px-4 rounded-xl font-sans-custom text-[14px] font-black text-white bg-[#1e1b18] hover:bg-[#2d2926] active:translate-y-0.5 transition-all shadow-[3px_3px_0px_#b45309] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-[#fde68a]" />
                  <span>ثبت و دریافت هدیه</span>
                </button>
              </>
            ) : (
              /* Success State */
              <div className="space-y-5 py-2">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#dcfce7] border-2 border-[#166534] shadow-[3px_3px_0px_#166534] flex items-center justify-center text-[#166534]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h3
                    id="darkroom-riddle-success-text"
                    className="font-sans-custom text-[15px] sm:text-[16px] font-black text-[#1e1b18] leading-relaxed"
                  >
                    عالی بود! تو برندهی تخفیف ۵۰ درصدی کارت پستال از کتابفروشی موزه شدی
                  </h3>
                </div>

                {/* Gift Voucher Card */}
                <div className="p-4 rounded-2xl bg-[#fefce8] border-2 border-dashed border-[#b45309] shadow-[3px_3px_0px_#1e1b18] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#fde68a] border border-[#1e1b18] font-sans-custom text-[11px] font-black text-[#92400e]">
                      کوپن جایزه
                    </span>
                    <Ticket className="w-5 h-5 text-[#b45309]" />
                  </div>
                  <div className="pt-1">
                    <p className="font-sans-custom text-[14px] font-black text-[#1e1b18]">
                      تخفیف ۵۰ درصدی کارت پستال از کتابفروشی موزه
                    </p>
                    {darkroomState.code && (
                      <div className="my-2 p-2 bg-white border border-[#1e1b18] rounded-xl text-center shadow-[1.5px_1.5px_0px_#1e1b18]">
                        <span className="text-[11px] font-bold text-stone-500 block mb-0.5">کد تخفیف اختصاصی شما:</span>
                        <span dir="ltr" className="font-mono font-black text-[15px] text-[#1e1b18] tracking-widest select-all">
                          {darkroomState.code}
                        </span>
                      </div>
                    )}
                    <p className="font-sans-custom text-[11px] font-bold text-stone-600 mt-1">
                      با ارائه این صفحه یا کد تخفیف به کتابفروشی موزه، از ۵۰٪ تخفیف خرید کارت پستال بهره‌مند شوید.
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-4 rounded-xl font-sans-custom text-[14px] font-black text-[#1e1b18] bg-[#fef3c7] hover:bg-[#fde68a] border-2 border-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>متوجه شدم</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DarkroomRiddleModal;
