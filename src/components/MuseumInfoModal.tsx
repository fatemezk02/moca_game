import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Compass, Layers, Smartphone, Sparkles, MapPin, Eye, Trophy, HelpCircle, CheckCircle2 } from 'lucide-react';

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
                راهنمای اجرای بازی
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

            {/* Game Guide & Objective Box */}
            <div className="border-2 border-[#1e1b18] rounded-2xl p-4 bg-[#e0f2fe] shadow-[3px_3px_0px_#1e1b18] space-y-3">
              <div className="flex items-center gap-2 font-sans-custom text-[13px] font-black text-[#0369a1]">
                <Compass className="w-4 h-4 text-[#0284c7]" />
                <span>هدف و نحوهٔ اجرای بازی</span>
              </div>
              
              <div className="space-y-2 text-[12px] text-[#1e293b]">
                <p className="font-bold text-[#0f172a]">
                  🎯 <strong>کارهایی که باید انجام دهید:</strong>
                </p>
                <ul className="space-y-1.5 pr-2 font-medium text-[#334155]">
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#0284c7] font-black">۱.</span>
                    <span>در پلان هر گالری کاوش کنید و روی <strong>نشانگرهای آثار هنری</strong> و <strong>ستاره‌های مخفی</strong> کلیک کنید.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#0284c7] font-black">۲.</span>
                    <span>به پرسش‌های جذاب هر اثر پاسخ دهید تا <strong>قطعات گمشدهٔ پازل</strong> آن گالری را به دست آورید.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-[#0284c7] font-black">۳.</span>
                    <span>با چیدن قطعات و تکمیل پازل، قفل ورود به <strong>گالری‌های بعدی</strong> را باز کنید.</span>
                  </li>
                </ul>

                <div className="pt-2 border-t border-[#bae6fd] space-y-1">
                  <p className="font-bold text-[#0f172a]">
                    🎁 <strong>جوایز و دستاوردهایی که دریافت می‌کنید:</strong>
                  </p>
                  <ul className="space-y-1 pr-2 font-medium text-[#334155] text-[11.5px]">
                    <li>• <strong>سکه و ستاره:</strong> با هر پاسخ صحیح و کشف ستاره‌های پنهان، امتیاز و سکه دریافت می‌کنید.</li>
                    <li>• <strong>کلکسیون آثار و دیوار کیوریتور:</strong> تابلوهای تکمیل‌شده به نمایشگاه شخصی شما اضافه می‌شوند.</li>
                    <li>• <strong>کارت نهایی افتخار:</strong> با اتمام تمامی گالری‌ها، کارت کیوریتور ارشد موزه با نام شما صادر می‌گردد.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* PWA & Touch interactions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="border-2 border-[#1e1b18] rounded-2xl p-3 bg-[#ffffff] shadow-[2px_2px_0px_#1e1b18]">
                <div className="flex items-center gap-1.5 font-sans-custom text-[12px] font-black text-[#1e1b18] uppercase mb-1">
                  <Smartphone className="w-4 h-4 text-[#f59e0b]" />
                  <span>لمس و بزرگنمایی</span>
                </div>
                <p className="text-[11px] text-[#64748b] font-medium">
                  با دو انگشت یا دکمه‌های کناری نقشه را زوم کنید و با کشیدن صفحه در سالن‌ها کاوش نمایید.
                </p>
              </div>

              <div className="border-2 border-[#1e1b18] rounded-2xl p-3 bg-[#ffffff] shadow-[2px_2px_0px_#1e1b18]">
                <div className="flex items-center gap-1.5 font-sans-custom text-[12px] font-black text-[#1e1b18] uppercase mb-1">
                  <Eye className="w-4 h-4 text-[#ef4444]" />
                  <span>پیش‌نمایش تکی</span>
                </div>
                <p className="text-[11px] text-[#64748b] font-medium">
                  انتخاب هر اثر پنجره قبلی را به نرمی می‌بندد و اثر جدید را متمرکز می‌کند.
                </p>
              </div>
            </div>

            {/* Asset Replacement Developer Guide & Admin Link */}
            <div className="border-2 border-[#1e1b18] rounded-2xl p-3.5 bg-[#fee2e2] shadow-[3px_3px_0px_#1e1b18] text-[12px] text-[#991b1b] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black flex items-center gap-1.5 text-[#1e1b18]">
                  <Sparkles className="w-4 h-4 text-[#ef4444]" />
                  مدیریت و پیکربندی نقشه
                </span>
                {onOpenAdmin && (
                  <button
                    onClick={onOpenAdmin}
                    className="neo-btn px-2.5 py-1 bg-[#ffffff] text-[#1e1b18] hover:bg-[#fef08a] text-[11px] font-black cursor-pointer"
                  >
                    پنل ادمین
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#7f1d1d] font-medium">
                پنل مدیریت امکان جابه‌جایی نقاط، فریم‌های آثار و فلش‌های راهنما روی نقشه را به صورت زنده فراهم می‌کند.
              </p>
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

