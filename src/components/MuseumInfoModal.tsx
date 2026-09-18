import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Compass, Sparkles } from 'lucide-react';

interface MuseumInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin?: () => void;
  onNavigateToGallery?: (
    galleryId:
      | 'gallery-00'
      | 'gallery-01'
      | 'gallery-02'
      | 'gallery-03'
      | 'gallery-04'
      | 'gallery-05'
      | 'gallery-06'
      | string
  ) => void;
}

export const MuseumInfoModal: React.FC<MuseumInfoModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onNavigateToGallery,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#1e1b18]/60 backdrop-blur-xs select-none">
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative z-10 w-full max-w-lg bg-[#ffffff] border-[2.5px] border-[#1e1b18] rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#1e1b18] space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#1e1b18] pb-3.5">
            <div>
              <span className="font-sans-custom text-[11px] text-[#ea580c] font-black tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                راهنمای موزه و نقشه
              </span>
              <h2 className="font-sans-custom text-[20px] font-black text-[#1e1b18]">
                آرشیو ۰۱ • راهنمای بخش‌ها و علائم
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#fee2e2] hover:bg-[#ef4444] hover:text-white transition-all text-[#1e1b18] border-2 border-[#1e1b18] shadow-[2px_2px_0px_#1e1b18] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-4 text-[13px] text-[#334155] leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
            {/* Gallery Sector Quick Navigation */}
            {onNavigateToGallery && (
              <div className="border-2 border-[#1e1b18] rounded-2xl p-3.5 bg-[#fef3c7] shadow-[3px_3px_0px_#1e1b18] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans-custom text-[12px] font-black text-[#1e1b18] uppercase flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#d97706]" />
                    <span>دسترسی سریع به گالری‌ها</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      onNavigateToGallery('gallery-00');
                      onClose();
                    }}
                    className="neo-btn p-2 bg-[#ffffff] hover:bg-[#fed7aa] text-center cursor-pointer text-[#1e1b18]"
                  >
                    <span className="block font-black text-[12px]">گالری ۰۰</span>
                    <span className="text-[10px] text-[#64748b]">آرشیو اصلی</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToGallery('gallery-01');
                      onClose();
                    }}
                    className="neo-btn p-2 bg-[#ffffff] hover:bg-[#fed7aa] text-center cursor-pointer text-[#1e1b18]"
                  >
                    <span className="block font-black text-[12px]">گالری ۰۱</span>
                    <span className="text-[10px] text-[#64748b]">معماری</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToGallery('gallery-03');
                      onClose();
                    }}
                    className="neo-btn p-2 bg-[#ffffff] hover:bg-[#fed7aa] text-center cursor-pointer text-[#1e1b18]"
                  >
                    <span className="block font-black text-[12px]">گالری ۰۳</span>
                    <span className="text-[10px] text-[#64748b]">هنر مدرن</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToGallery('gallery-04');
                      onClose();
                    }}
                    className="neo-btn p-2 bg-[#ffffff] hover:bg-[#fed7aa] text-center cursor-pointer text-[#1e1b18]"
                  >
                    <span className="block font-black text-[12px]">گالری ۰۴</span>
                    <span className="text-[10px] text-[#64748b]">ثبت دوام ما</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToGallery('gallery-05');
                      onClose();
                    }}
                    className="neo-btn p-2 bg-[#ffffff] hover:bg-[#fed7aa] text-center cursor-pointer text-[#1e1b18]"
                  >
                    <span className="block font-black text-[12px]">گالری ۰۵</span>
                    <span className="text-[10px] text-[#64748b]">ضرب آهنگ شهر</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToGallery('gallery-06');
                      onClose();
                    }}
                    className="neo-btn p-2 bg-[#ffffff] hover:bg-[#fed7aa] text-center cursor-pointer text-[#1e1b18]"
                  >
                    <span className="block font-black text-[12px]">گالری ۰۶</span>
                    <span className="text-[10px] text-[#64748b]">در کشاکش تماشا</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToGallery('gallery-07');
                      onClose();
                    }}
                    className="neo-btn p-2 bg-[#ffffff] hover:bg-[#fed7aa] text-center cursor-pointer text-[#1e1b18]"
                  >
                    <span className="block font-black text-[12px]">گالری ۰۷</span>
                    <span className="text-[10px] text-[#64748b]">گذر از برون به درون</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToGallery('gallery-08');
                      onClose();
                    }}
                    className="neo-btn p-2 bg-[#ffffff] hover:bg-[#fed7aa] text-center cursor-pointer text-[#1e1b18]"
                  >
                    <span className="block font-black text-[12px]">گالری ۰۸</span>
                    <span className="text-[10px] text-[#64748b]">آونگ زمان</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToGallery('gallery-09');
                      onClose();
                    }}
                    className="neo-btn p-2 bg-[#ffffff] hover:bg-[#fed7aa] text-center cursor-pointer text-[#1e1b18]"
                  >
                    <span className="block font-black text-[12px]">گالری ۰۹</span>
                    <span className="text-[10px] text-[#64748b]">تلاقی رسانه‌ها</span>
                  </button>
                </div>
              </div>
            )}

            {/* Wall Reveal Explanation */}
            <div className="border-2 border-[#1e1b18] rounded-2xl p-3.5 bg-[#e0f2fe] shadow-[3px_3px_0px_#1e1b18] space-y-2">
              <div className="flex items-center gap-2 font-sans-custom text-[12px] font-black text-[#1e1b18] uppercase">
                <Compass className="w-4 h-4 text-[#0284c7]" />
                <span>راهنمای بازی</span>
              </div>
              <p className="text-[12px] text-[#334155] font-medium">
                در گالریهای موزه، هشت تصویر گمشده پنهان شدهاند. برای پیدا کردن هر تصویر، باید کشفهای اصلی هر گالری را پیدا کنی و با پاسخ دادن به سؤالها، قطعات آن را آزاد کنی. در طول مسیر، سرنخها، کشفهای اختیاری و تجربههای ویژهای هم وجود دارند که میتوانند تو را بیشتر با داستان آثار آشنا کنند. نقشه را دنبال کن، کشف کن و آلبوم تصاویرت را کامل کن.
              </p>
              <ul className="text-[11px] font-bold space-y-1.5 text-[#475569] pl-2 border-l-2 border-[#0284c7]">
                <li>• <strong>🧩 پازلها:</strong> در هر گالری، سه کشف اصلی وجود دارد. با پیدا کردن هر اثر و پاسخ دادن به سؤال آن، یک قطعه از تصویر گمشده را به دست میآوری. با کامل شدن هر سه قطعه، تصویر نهایی آشکار میشود.</li>
                <li>• <strong>⭐️ ستارهها:</strong> ستارهها نشاندهندهی کشفهای اختیاری هستند. میتوانی آنها را پیدا کنی، به سؤالهایشان پاسخ بدهی و سکه دریافت کنی یا با پرداخت سکه، اطلاعات بیشتری دربارهی آثار کشف کنی.</li>
                <li>• <strong>✨ تجربههای ویژه:</strong> در بعضی گالریها تجربههای تعاملی وجود دارد که تو را از تماشای سادهی آثار فراتر میبرد. با امتحان کردن آنها میتوانی بخشی از ایده یا فرایند پشت آثار را به شکل عملی تجربه کنی.</li>
              </ul>
            </div>
          </div>

          {/* Footer button */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="neo-btn w-full py-3 bg-[#f59e0b] hover:bg-[#d97706] text-[#1e1b18] text-[13px] font-black cursor-pointer"
            >
              کاوش در نقشه موزه
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

