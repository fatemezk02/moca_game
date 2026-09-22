import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Puzzle, Star, Coins, Trophy, Compass, ChevronLeft, ChevronRight, Sparkles, Eye } from 'lucide-react';
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
    <div className={`fixed inset-0 text-[#1e1b18] z-50 flex flex-col items-center font-sans-custom overflow-y-auto ${step === 'guide' ? 'bg-[#fbf9f9]/80 backdrop-blur-md justify-between p-4 sm:p-6 pb-5 sm:pb-6' : 'bg-[#dedcd9]/85 backdrop-blur-md justify-between pt-[14px] px-4 pb-[4vh] sm:px-6'}`} dir="rtl">
      <div className={`w-full max-w-md flex flex-col ${step === 'guide' ? 'h-full flex-1 justify-between' : 'h-full flex-1 justify-between gap-4 mt-0'}`}>
        
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

            <form onSubmit={handleProfileSubmit} className="flex-1 flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="user-name" className="text-sm font-bold text-[#1e1b18] mr-[5%]">
                    نام شما
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="نام خود را وارد کنید"
                    className="w-full h-12 px-4 rounded-xl border-2 border-[#1e1b18] bg-white text-[#1e1b18] font-bold outline-none focus:ring-4 focus:ring-[#fafafa] focus:border-[#fafafa] transition-all placeholder:font-normal placeholder:text-[#635d57]"
                    maxLength={20}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-bold text-[#1e1b18] text-center">
                    آواتار خود را انتخاب کنید
                  </label>
                  
                  <div className="w-[85%] mx-auto grid grid-cols-3 gap-3.5 sm:gap-4 justify-items-center py-1">
                    {AVATAR_OPTIONS.map((avatar) => {
                      const isSelected = selectedAvatarId === avatar.id;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setSelectedAvatarId(avatar.id)}
                          className={`flex items-center justify-center p-1 rounded-full transition-all cursor-pointer ${
                            isSelected 
                              ? 'scale-110 ring-4 ring-[#fafafa] ring-offset-2 ring-offset-[#dedcd9]' 
                              : 'opacity-85 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <ProfileAvatar avatarId={avatar.id} size="lg" className="pointer-events-none" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid}
                className={`mt-auto w-full h-13 rounded-xl border-2 border-[#1e1b18] font-black text-base sm:text-lg transition-all ${
                  isFormValid
                    ? 'bg-[#fafafa] text-[#1e1b18] shadow-[3px_3px_0px_#1e1b18] hover:bg-[#ededed] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[2px_2px_0px_#1e1b18] active:translate-y-[3px] active:translate-x-[3px] active:shadow-none cursor-pointer'
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

            {/* 3. Centered Guide Text Boxes Area (Horizontal Slider) */}
            <div
              className="w-full my-auto overflow-hidden relative select-none grid grid-cols-1 grid-rows-1 isolate"
              style={{
                padding: '6px 8px',
                margin: '-6px -8px',
                width: 'calc(100% + 16px)',
              }}
            >
              {/* Guide Page 1 */}
              <motion.div
                key="guide-slide-0"
                initial={false}
                animate={{ x: guideSlide === 0 ? '0%' : '125%' }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                drag={guideSlide === 0 ? 'x' : false}
                dragSnapToOrigin
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 30 || Math.abs(info.velocity.x) > 100) {
                    setGuideSlide(1);
                  }
                }}
                className={`col-start-1 row-start-1 w-full space-y-3.5 px-2 py-1.5 cursor-grab active:cursor-grabbing touch-pan-y self-center ${
                  guideSlide === 0 ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                aria-hidden={guideSlide !== 0}
              >
                <div className="border-2 border-[#1e1b18] rounded-2xl p-4 bg-[#e0f2fe] shadow-[2.5px_2.5px_0px_#1e1b18] text-right flex flex-col items-start">
                  <div className="flex items-center gap-2 font-black text-xs text-[#0369a1] mb-2">
                    <Compass className="w-4 h-4 text-[#0284c7] shrink-0" />
                    <span>داستان و هدف بازی</span>
                  </div>
                  <p className="text-xs sm:text-[13px] text-[#1e293b] leading-relaxed font-medium text-right">
                    در این بازی ۸ اثر مربوط به ۸ برهه مهم تاریخ عکاسی جهان را پیدا می‌کنی و از این طریق با ابعاد متفاوت عکاسی و مسیرش از فن به فرهنگ و هنر آشنا می‌شوی.
                  </p>
                </div>

                <div className="border-2 border-[#1e1b18] rounded-2xl p-3.5 bg-[#ffffff] shadow-[2.5px_2.5px_0px_#1e1b18] text-right flex flex-col items-start">
                  <div className="flex items-center gap-2 font-black text-xs text-[#1e1b18] mb-1.5">
                    <Sparkles className="w-4 h-4 text-[#f59e0b] shrink-0" />
                    <span>چگونه بازی کنیم؟</span>
                  </div>
                  <ul className="text-[11px] sm:text-xs text-[#475569] leading-relaxed font-medium text-right space-y-1 w-full list-none">
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#f59e0b] font-bold shrink-0">•</span>
                      <span>در هر گالری تکه‌های پازل رو جمع کن</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#f59e0b] font-bold shrink-0">•</span>
                      <span>اطلاعات جالب رو کشف کن یا با تجربه‌های تعاملی آشنا شو</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-[#f59e0b] font-bold shrink-0">•</span>
                      <span>و با استفاده از فلش‌های راهنما به گالری بعدی برو تا به زمان حال برسی</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Guide Page 2 */}
              <motion.div
                key="guide-slide-1"
                initial={false}
                animate={{ x: guideSlide === 0 ? '-125%' : '0%' }}
                transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                drag={guideSlide === 1 ? 'x' : false}
                dragSnapToOrigin
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (Math.abs(info.offset.x) > 30 || Math.abs(info.velocity.x) > 100) {
                    setGuideSlide(0);
                  }
                }}
                className={`col-start-1 row-start-1 w-full px-2 py-1.5 cursor-grab active:cursor-grabbing touch-pan-y self-center ${
                  guideSlide === 1 ? 'pointer-events-auto' : 'pointer-events-none'
                }`}
                aria-hidden={guideSlide !== 1}
              >
                <div className="border-2 border-[#1e1b18] rounded-2xl p-3 sm:p-3.5 bg-[#ffffff] shadow-[2.5px_2.5px_0px_#1e1b18] text-right flex flex-col gap-2.5">
                  <div className="flex items-center text-right gap-2.5">
                    <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#c084fc] flex items-center justify-center shrink-0">
                      <Puzzle className="w-4 h-4 text-[#1e1b18]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#1e1b18] block">پازل‌ها</span>
                      <p className="text-[11px] text-[#581c87] font-medium leading-tight">
                        در هر گالری به محدوده پازل‌ها برو. سؤالات پازل تو را با هویت عکاسی در هر دوره آشنا می‌کنند.
                      </p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#e2e8f0] w-full" />

                  <div className="flex items-center text-right gap-2.5">
                    <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#34d399] flex items-center justify-center shrink-0">
                      <Star className="w-4 h-4 text-[#1e1b18]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#1e1b18] block">ستاره‌ها</span>
                      <p className="text-[11px] text-[#064e3b] font-medium leading-tight">
                        با رفتن به محدوده نقاط ستاره می‌تونی با سکه یا پاسخ به سؤال اطلاعات اضافه و جالب کشف کنی.
                      </p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#e2e8f0] w-full" />

                  <div className="flex items-center text-right gap-2.5">
                    <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#facc15] flex items-center justify-center shrink-0">
                      <Coins className="w-4 h-4 text-[#1e1b18]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#1e1b18] block">سکه‌ها</span>
                      <p className="text-[11px] text-[#713f12] font-medium leading-tight">
                        سکه‌ها بخشی از پاداش پاسخ به سؤالات ستاره یا تجربه هستند و می‌تونی با اون‌ها قفل گالری یا اطلاعات رو باز کنی.
                      </p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#e2e8f0] w-full" />

                  <div className="flex items-center text-right gap-2.5">
                    <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#38bdf8] flex items-center justify-center shrink-0">
                      <Eye className="w-4 h-4 text-[#1e1b18]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#1e1b18] block">تجربه</span>
                      <p className="text-[11px] text-[#0369a1] font-medium leading-tight">
                        این نقاط حاوی اطلاعات جالب یا محتوای چندرسانه‌ای درباره ابزارهای تجربه تعاملی در موزه هستند.
                      </p>
                    </div>
                  </div>

                  <div className="h-[1px] bg-[#e2e8f0] w-full" />

                  <div className="flex items-center text-right gap-2.5">
                    <div className="w-7 h-7 rounded-lg border-2 border-[#1e1b18] bg-[#fb923c] flex items-center justify-center shrink-0">
                      <Trophy className="w-4 h-4 text-[#1e1b18]" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-[#1e1b18] block">پایان بازدید</span>
                      <p className="text-[11px] text-[#7c2d12] font-medium leading-tight">
                        گواهی‌نامه کشف تاریخ عکاسی را به همراه یک جایزه از طرف موزه دریافت می‌کنی.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
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

