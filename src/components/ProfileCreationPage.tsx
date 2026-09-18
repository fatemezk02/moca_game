import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Puzzle, Star, Coins, Trophy, Compass, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { AVATAR_OPTIONS } from '../data/avatarConfig';
import { ProfileAvatar } from './ProfileAvatar';
import { saveUserProfile } from '../data/userProfileStore';

interface ProfileCreationPageProps {
  onProfileCreated: () => void;
}

export const ProfileCreationPage: React.FC<ProfileCreationPageProps> = ({
  onProfileCreated,
}) => {
  const [step, setStep] = useState<'profile' | 'guide'>('profile');
  const [guideSlide, setGuideSlide] = useState<0 | 1>(0);
  const [name, setName] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);

  const isFormValid = name.trim().length > 0 && selectedAvatarId !== null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      setStep('guide');
      setGuideSlide(0);
    }
  };

  const handleFinishGuide = () => {
    if (isFormValid) {
      saveUserProfile({
        name: name.trim(),
        avatarId: selectedAvatarId,
      });
      onProfileCreated();
    }
  };

  return (
    <div className={`fixed inset-0 text-[#1e1b18] z-50 flex flex-col items-center font-sans-custom overflow-y-auto ${step === 'guide' ? 'bg-[#fbf9f9]/80 backdrop-blur-md justify-between p-4 sm:p-6 pb-5 sm:pb-6' : 'bg-[#b5b3b3]/85 backdrop-blur-md justify-start pt-[14px] px-4 pb-6 sm:px-6'}`} dir="rtl">
      <div className={`w-full max-w-md flex flex-col ${step === 'guide' ? 'h-full flex-1 justify-between' : 'gap-5 mt-0 shrink-0'}`}>
        
        {step === 'profile' ? (
          <>
            <div className="text-center flex flex-col items-center pt-0">
              <div className="flex items-center justify-center">
                <img
                  src="/login-logo.svg"
                  alt="لوگوی موزه هنرهای معاصر تهران"
                  className="h-[131px] w-auto max-w-full object-contain cursor-default"
                />
              </div>
              <h1 className="text-[13.9px] sm:text-[16.6px] font-semibold text-[#1e1b18] mt-[14px]">
                به سفر تاریخ عکاسی جهان خوش آمدید
              </h1>
            </div>

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="user-name" className="text-sm font-bold text-[#1e1b18]">
                  نام شما
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="نام خود را وارد کنید"
                  className="w-full h-12 px-4 rounded-xl border-2 border-[#1e1b18] bg-white text-[#1e1b18] font-bold outline-none focus:ring-4 focus:ring-[#d96c60]/30 focus:border-[#d96c60] transition-all placeholder:font-normal placeholder:text-[#635d57]"
                  maxLength={20}
                  autoComplete="off"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-sm font-bold text-[#1e1b18] text-center">
                  آواتار خود را انتخاب کنید
                </label>
                
                <div className="grid grid-cols-3 gap-3.5 sm:gap-4 justify-items-center py-1">
                  {AVATAR_OPTIONS.map((avatar) => {
                    const isSelected = selectedAvatarId === avatar.id;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={`flex items-center justify-center p-1 rounded-full transition-all cursor-pointer ${
                          isSelected 
                            ? 'scale-110 ring-4 ring-[#d96c60] ring-offset-2 ring-offset-[#b5b3b3]' 
                            : 'opacity-85 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <ProfileAvatar avatarId={avatar.id} size="lg" className="pointer-events-none" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className={`mt-2 w-full h-13 rounded-xl border-2 border-[#1e1b18] font-black text-base sm:text-lg transition-all ${
                  isFormValid
                    ? 'bg-[#d9d8d4] text-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] hover:bg-[#e4e2de] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1e1b18] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer'
                    : 'bg-[#b8b5ae] text-[#423f3a] border-[#1e1b18] shadow-none cursor-not-allowed opacity-80'
                }`}
              >
                ادامه
              </button>
            </form>
          </>
        ) : (
          /* Guide Walkthrough Step (2 Slides) */
          <div className="flex flex-col items-center text-center h-full flex-1 justify-between w-full">
            <div className="w-full">
              {/* 1. Large Bold Title at Top Center */}
              <h1 className="text-xl sm:text-2xl font-black text-[#1e1b18] text-center mb-3">
                راهنمای شروع بازی
              </h1>

              {/* 2. Greeting Above Avatar & Centered Avatar */}
              <div className="flex flex-col items-center justify-center mb-3">
                <span className="text-sm sm:text-base font-bold text-[#1e1b18] mb-2">
                  {name.trim() ? `سلام ${name.trim()}! 👋` : 'سلام دوست من! 👋'}
                </span>
                {selectedAvatarId && (
                  <ProfileAvatar avatarId={selectedAvatarId} size="lg" className="shrink-0" />
                )}
              </div>
            </div>

            {/* 3. Centered Guide Text Boxes Area */}
            <div className="w-full py-2 my-auto flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {guideSlide === 0 ? (
                  <motion.div
                    key="slide-0"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3.5 w-full"
                  >
                    <div className="border-2 border-[#1e1b18] rounded-2xl p-4 bg-[#e0f2fe] shadow-[2.5px_2.5px_0px_#1e1b18] text-right flex flex-col items-start">
                      <div className="flex items-center gap-2 font-black text-xs text-[#0369a1] mb-2">
                        <Compass className="w-4 h-4 text-[#0284c7] shrink-0" />
                        <span>داستان و هدف بازی</span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-[#1e293b] leading-relaxed font-medium text-right">
                        در گالری‌های موزه، <strong className="text-[#0369a1] font-black">۸ تصویر گمشده</strong> از تاریخ عکاسی پنهان شده‌اند. برای پیدا کردن هر تصویر، باید کشف‌های اصلی هر گالری را پیدا کنی و با پاسخ دادن به سؤال‌ها، قطعات آن را آزاد کنی.
                      </p>
                    </div>

                    <div className="border-2 border-[#1e1b18] rounded-2xl p-3.5 bg-[#ffffff] shadow-[2.5px_2.5px_0px_#1e1b18] text-right flex flex-col items-start">
                      <div className="flex items-center gap-2 font-black text-xs text-[#1e1b18] mb-1.5">
                        <Sparkles className="w-4 h-4 text-[#f59e0b] shrink-0" />
                        <span>چگونه بازی کنیم؟</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-[#475569] leading-relaxed font-medium text-right">
                        نقشه را دنبال کن، به نشانه‌های روی زمین و دیوارها سر بزن، معماها را حل کن و آلبوم تصاویر گمشده‌ات را کامل کن!
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="slide-1"
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 15 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2.5 w-full"
                  >
                    <div className="border-2 border-[#1e1b18] rounded-xl p-2.5 bg-[#fef3c7] shadow-[2px_2px_0px_#1e1b18] flex items-center text-right gap-2.5">
                      <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#fbbf24] flex items-center justify-center shrink-0">
                        <Puzzle className="w-4 h-4 text-[#1e1b18]" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#1e1b18] block">پازل‌ها</span>
                        <p className="text-[11px] text-[#451a03] font-medium leading-tight">
                          ۳ کشف اصلی در هر سالن. با پاسخ به سؤال هر اثر، ۱ قطعه از تصویر گمشده را به دست می‌آوری.
                        </p>
                      </div>
                    </div>

                    <div className="border-2 border-[#1e1b18] rounded-xl p-2.5 bg-[#ecfdf5] shadow-[2px_2px_0px_#1e1b18] flex items-center text-right gap-2.5">
                      <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#34d399] flex items-center justify-center shrink-0">
                        <Star className="w-4 h-4 text-[#1e1b18] fill-[#1e1b18]" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#1e1b18] block">ستاره‌ها</span>
                        <p className="text-[11px] text-[#064e3b] font-medium leading-tight">
                          کشف‌های اختیاری در سالن‌ها برای کسب سکه یا دسترسی به اطلاعات جذاب‌تر درباره آثار.
                        </p>
                      </div>
                    </div>

                    <div className="border-2 border-[#1e1b18] rounded-xl p-2.5 bg-[#fef9c3] shadow-[2px_2px_0px_#1e1b18] flex items-center text-right gap-2.5">
                      <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#facc15] flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4 text-[#1e1b18]" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#1e1b18] block">سکه‌ها</span>
                        <p className="text-[11px] text-[#713f12] font-medium leading-tight">
                          پاداش پاسخ‌های صحیح که می‌توانی برای خرید سرنخ‌ها و باز کردن بخش‌های ویژه خرج کنی.
                        </p>
                      </div>
                    </div>

                    <div className="border-2 border-[#1e1b18] rounded-xl p-2.5 bg-[#ffedd5] shadow-[2px_2px_0px_#1e1b18] flex items-center text-right gap-2.5">
                      <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#fb923c] flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4 text-[#1e1b18]" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-[#1e1b18] block">جایزه نهایی</span>
                        <p className="text-[11px] text-[#7c2d12] font-medium leading-tight">
                          با باز کردن هر ۸ تصویر، گواهی‌نامه اختصاصی و کارت افتخاری پایان موزه برایت باز می‌شود!
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Group: Pagination Dots & Action Button */}
            <div className="w-full mt-auto flex flex-col items-center gap-2 pt-2 shrink-0">
              {/* 4. Pagination Dots at Bottom of Page */}
              <div className="flex items-center justify-center gap-3 py-1">
                <button
                  type="button"
                  onClick={() => setGuideSlide(0)}
                  aria-label="اسلاید ۱"
                  className={`h-3 rounded-full transition-all cursor-pointer ${
                    guideSlide === 0
                      ? 'w-7 bg-[#1e1b18]'
                      : 'w-3 bg-[#a8a29e] hover:bg-[#78716c]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setGuideSlide(1)}
                  aria-label="اسلاید ۲"
                  className={`h-3 rounded-full transition-all cursor-pointer ${
                    guideSlide === 1
                      ? 'w-7 bg-[#1e1b18]'
                      : 'w-3 bg-[#a8a29e] hover:bg-[#78716c]'
                  }`}
                />
              </div>

              {/* Action Button: Show 'متوجه شدم' on Slide 1 */}
              {guideSlide === 1 && (
                <div className="w-full mt-1">
                  <button
                    type="button"
                    onClick={handleFinishGuide}
                    className="w-full h-12 rounded-xl border-2 border-[#1e1b18] bg-[#22c55e] text-[#1e1b18] font-black text-base shadow-[3px_3px_0px_#1e1b18] hover:bg-[#16a34a] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1e1b18] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>متوجه شدم</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

