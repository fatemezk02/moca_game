import React, { useState, useEffect } from 'react';
import {
  GALLERIES,
  getGalleryPoints,
  saveGalleryPoints,
  resetGalleryPoints,
  createNewPuzzlePoint,
} from '../data/mapConfig';
import { contentService } from '../services/content/contentService';
import { DEFAULT_STAR_DISCOVERIES } from '../data/starDiscoveryData';
import { normalizeGalleryId } from '../services/content/mappers';
import {
  AdminMapPoint,
  AdminCollectionPoint,
  AdminIconPoint,
  AdminPuzzlePoint,
  ArtworkFrameConfig,
  GalleryConfig,
} from '../types/admin';
import { AdminMapCanvas } from './AdminMapCanvas';
import { ArtworkFrameEditor } from './ArtworkFrameEditor';
import { CustomIconRender } from './CustomIconRender';
import { GalleryQuestionsArtworkEditor } from './GalleryQuestionsArtworkEditor';
import { AdminArrowEditor } from './AdminArrowEditor';
import { AdminGalleryAreasEditor } from './AdminGalleryAreasEditor';
import {
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  MapPin,
  Image as ImageIcon,
  Compass,
  Sliders,
  HelpCircle,
  LogIn,
  Star,
  Info,
  CheckCircle,
  Layers,
  Upload,
  LayoutGrid,
  Navigation,
  Puzzle,
  Trees,
} from 'lucide-react';

interface AdminManagementViewProps {
  onCloseAdmin: () => void;
  initialGalleryId?: string;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  onCloseAdmin,
  initialGalleryId = 'gallery-01',
}) => {
  const [adminSection, setAdminSection] = useState<
    'map-points' | 'arrows' | 'gallery-areas' | 'questions-artwork'
  >('map-points');
  const [selectedGalleryId, setSelectedGalleryId] = useState<string>(initialGalleryId);
  const [points, setPoints] = useState<AdminMapPoint[]>([]);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'collection' | 'star' | 'icon' | 'puzzle'>('all');

  const currentGallery: GalleryConfig =
    GALLERIES.find((g) => g.id === selectedGalleryId) || GALLERIES[0];

  // Canonical definition of all existing Star Points in the live game for each gallery
  const GALLERY_CANONICAL_STARS: Record<
    string,
    { id: string; starId: string; title: string; defaultX: number; defaultY: number }[]
  > = {
    'gallery-01': [
      { id: 'artwork-01', starId: 'star-01', title: 'کالوتایپ — فاکس تالبوت', defaultX: 137, defaultY: 211 },
      { id: 'star-02', starId: 'star-02', title: 'مجله‌های Camera Work', defaultX: 317, defaultY: 518 },
    ],
    'gallery-02': [
      { id: 'artwork-01', starId: 'star-01', title: 'North Apse Monolith', defaultX: 137, defaultY: 211 },
      { id: 'star-02', starId: 'star-02', title: 'مجله‌های Camera Work', defaultX: 317, defaultY: 518 },
    ],
    'gallery-03': [
      { id: 'artwork-g03-star', starId: 'star-03', title: 'در جست‌وجوی فن و فضیلت', defaultX: 363, defaultY: 446 },
      { id: 'star-04', starId: 'star-04', title: 'چهره‌های مشهور، در یک قاب', defaultX: 362, defaultY: 227 },
      { id: 'star-05', starId: 'star-05', title: 'ژاپن در یک قاب', defaultX: 504, defaultY: 120 },
      { id: 'star-06', starId: 'star-06', title: 'خودنگارهٔ چرخان نادار', defaultX: 442, defaultY: 214 },
    ],
    'gallery-04': [
      { id: 'star-07', starId: 'star-07', title: 'ایا عکاسی میتواند شبیه نقاشی باشد', defaultX: 240, defaultY: 800 },
    ],
    'gallery-05': [
      { id: 'star-08', starId: 'star-08', title: 'وقتی شهر از زاویه‌ای تازه دیده می‌شود', defaultX: 456, defaultY: 58 },
      { id: 'star-09', starId: 'star-09', title: 'پاریسِ اوژن آتژه', defaultX: 245, defaultY: 58 },
      { id: 'star-10', starId: 'star-10', title: 'انسان‌ها و شهر', defaultX: 469, defaultY: 338 },
      { id: 'star-11', starId: 'star-11', title: 'تقاطع مخروطها', defaultX: 455, defaultY: 611 },
    ],
    'gallery-06': [
      { id: 'star-12', starId: 'star-12', title: 'ستاره کشف ۱۲ — سیاستِ نگاه', defaultX: 451, defaultY: 536 },
      { id: 'star-13', starId: 'star-13', title: 'ستاره کشف ۱۳ — بستر معنا و تصویر', defaultX: 451, defaultY: 641 },
      { id: 'star-14', starId: 'star-14', title: 'ستاره کشف ۱۴ — تصویر و حافظه', defaultX: 450, defaultY: 588 },
      { id: 'star-15', starId: 'star-15', title: 'افق‌های نوین نقد', defaultX: 449, defaultY: 339 },
      { id: 'col-8549', starId: 'col-8549', title: 'مجموعه جدید (8549-col)', defaultX: 200, defaultY: 359 },
      { id: 'col-6925', starId: 'col-6925', title: 'مجموعه جدید (6925-col)', defaultX: 327, defaultY: 738 },
      { id: 'col-0594', starId: 'col-0594', title: 'مجموعه جدید (0594-col)', defaultX: 50, defaultY: 153 },
      { id: 'star-16', starId: 'star-16', title: 'اصفهان، نیویورک', defaultX: 380, defaultY: 240 },
      { id: 'star-17', starId: 'star-17', title: 'پیشنهاد برای تغییر زمین', defaultX: 380, defaultY: 500 },
      { id: 'star-18', starId: 'star-18', title: 'بازخوانی دههٔ ۱۹۶۰', defaultX: 380, defaultY: 760 },
    ],
    'gallery-07': [
      { id: 'star-19', starId: 'star-19', title: 'ستاره کشف ۱۹', defaultX: 342, defaultY: 544 },
    ],
    'gallery-08': [],
    'gallery-09': [
      { id: 'star-24', starId: 'star-24', title: 'ستاره کشف ۲۴', defaultX: 401, defaultY: 215 },
      { id: 'star-25', starId: 'star-25', title: 'ستاره کشف ۲۵', defaultX: 253, defaultY: 667 },
      { id: 'col-g09-01', starId: 'col-g09-01', title: 'تابلو فرش', defaultX: 137, defaultY: 111 },
      { id: 'col-g09-02', starId: 'col-g09-02', title: 'سوپ داگر', defaultX: 249, defaultY: 48 },
      { id: 'col-g09-03', starId: 'col-g09-03', title: 'عکسها و حکاکی ها', defaultX: 137, defaultY: 374 },
      { id: 'col-g09-04', starId: 'col-g09-04', title: 'بدون عنوان سگ سه پا', defaultX: 138, defaultY: 602 },
    ],
  };

  // Helper function to load points for a gallery with guaranteed inclusion of ALL Star Points
  const loadEnrichedPointsForGallery = (galleryId: string): AdminMapPoint[] => {
    const loaded = getGalleryPoints(galleryId);
    const result: AdminMapPoint[] = [...loaded];

    const canonKey = normalizeGalleryId(galleryId).replace('_', '-');
    const canonicalStars =
      GALLERY_CANONICAL_STARS[canonKey] || GALLERY_CANONICAL_STARS[galleryId] || [];

    canonicalStars.forEach((starDef) => {
      const existingIndex = result.findIndex((p) => {
        if (p.id === starDef.id) return true;
        if (p.id === starDef.starId) return true;
        if (
          p.type === 'collection' &&
          (p as AdminCollectionPoint).starId === starDef.starId
        )
          return true;
        return false;
      });

      // Attempt to retrieve title from ContentService or DEFAULT_STAR_DISCOVERIES
      const contentStar =
        contentService.getStars().find((s) => s.id === starDef.starId || s.starId === starDef.starId) ||
        contentService.getStarForStarPoint(starDef.id, galleryId, starDef.starId) ||
        (DEFAULT_STAR_DISCOVERIES as any)[starDef.starId];
      const resolvedTitle =
        contentStar?.titleFa || contentStar?.labelTextFa || starDef.title;

      if (existingIndex !== -1) {
        const existing = result[existingIndex];
        if (existing.type === 'collection') {
          const colPt = existing as AdminCollectionPoint;
          colPt.pointType = 'star';
          if (!colPt.starId) {
            colPt.starId = starDef.starId;
          }
          if (!colPt.title || colPt.title === colPt.id) {
            colPt.title = resolvedTitle;
          }
        }
      } else {
        result.push({
          id: starDef.id,
          starId: starDef.starId,
          type: 'collection',
          pointType: 'star',
          galleryId: galleryId,
          title: resolvedTitle,
          x: starDef.defaultX,
          y: starDef.defaultY,
          frames: [],
        });
      }
    });

    // Also include any stars from ContentService or DEFAULT_STAR_DISCOVERIES for this gallery
    const serviceStars = contentService.getStars();
    const allDiscoveries = [
      ...Object.values(DEFAULT_STAR_DISCOVERIES),
      ...serviceStars,
    ];
    const canonSelected = normalizeGalleryId(galleryId);

    allDiscoveries.forEach((disc) => {
      const dGallery = normalizeGalleryId(disc.galleryId || '');
      const isMatch =
        dGallery === canonSelected ||
        disc.galleryId === galleryId ||
        ((canonSelected === 'gallery_01' || galleryId === 'gallery-01') &&
          (dGallery === 'gallery_01' ||
            dGallery === 'gallery_02' ||
            disc.galleryId === 'gallery-02'));

      if (isMatch) {
        const starId = disc.starId || disc.id;
        const alreadyExists = result.some(
          (p) =>
            p.id === starId ||
            (p.type === 'collection' &&
              ((p as AdminCollectionPoint).starId === starId ||
                ((p as AdminCollectionPoint).pointType === 'star' && p.id === starId)))
        );

        if (!alreadyExists) {
          result.push({
            id: starId,
            starId: starId,
            type: 'collection',
            pointType: 'star',
            galleryId: galleryId,
            title: disc.titleFa || disc.labelTextFa || `ستاره کشف ${starId}`,
            x: 300,
            y: 300,
            frames: [],
          });
        }
      }
    });

    return result;
  };

  // Load points for the selected gallery, ensuring all configured points and all gallery Star Points are present
  useEffect(() => {
    const result = loadEnrichedPointsForGallery(selectedGalleryId);
    setPoints(result);
    if (result.length > 0) {
      setSelectedPointId(result[0].id);
    } else {
      setSelectedPointId(null);
    }
  }, [selectedGalleryId]);

  // Handle Save
  const handleSave = () => {
    saveGalleryPoints(selectedGalleryId, points);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Handle Reset to defaults
  const handleReset = () => {
    if (
      window.confirm(
        'آیا مطمئن هستید که می‌خواهید تمام نقاط این گالری را به حالت پیش‌فرض بازنشانی کنید؟'
      )
    ) {
      resetGalleryPoints(selectedGalleryId);
      const enriched = loadEnrichedPointsForGallery(selectedGalleryId);
      setPoints(enriched);
      if (enriched.length > 0) setSelectedPointId(enriched[0].id);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  // Update a point's coordinates (from dragging on SVG or numeric inputs)
  const handleUpdateCoordinates = (pointId: string, x: number, y: number) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === pointId ? { ...p, x, y } : p))
    );
  };

  // Update entire point object
  const handleUpdatePoint = (updatedPoint: AdminMapPoint) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === updatedPoint.id ? updatedPoint : p))
    );
  };

  // Add a new Collection Point (Type A)
  const handleAddCollectionPoint = () => {
    const newId = `col-${Date.now().toString().slice(-4)}`;
    const newPoint: AdminCollectionPoint = {
      id: newId,
      type: 'collection',
      pointType: 'normal',
      galleryId: selectedGalleryId,
      title: `مجموعه جدید (${newId})`,
      roomCode: `SEC ${points.length + 1}`,
      roomSection: 'GALLERY WING',
      x: Math.round(currentGallery.width / 2),
      y: Math.round(currentGallery.height / 2),
      direction: 'left',
      frames: [
        {
          id: `${newId}-f1`,
          order: 1,
          x: 0,
          y: 0,
          scale: 1,
        },
      ],
    };

    const next = [...points, newPoint];
    setPoints(next);
    setSelectedPointId(newId);
    saveGalleryPoints(selectedGalleryId, next);
  };

  // Add a new Custom Icon Point (Type B)
  const handleAddIconPoint = () => {
    const newId = `icon-${Date.now().toString().slice(-4)}`;
    const newPoint: AdminIconPoint = {
      id: newId,
      type: 'icon',
      galleryId: selectedGalleryId,
      title: `آیکون تعاملی (${newId})`,
      x: Math.round(currentGallery.width / 2),
      y: Math.round(currentGallery.height / 2),
      iconType: 'preset-question',
      width: 44,
      height: 34,
      destination: 'gallery-01-questions',
    };

    const next = [...points, newPoint];
    setPoints(next);
    setSelectedPointId(newId);
    saveGalleryPoints(selectedGalleryId, next);
  };

  // Add a new Puzzle Point
  const handleAddPuzzlePoint = () => {
    const newPoint = createNewPuzzlePoint(
      selectedGalleryId,
      Math.round(currentGallery.width / 2),
      Math.round(currentGallery.height / 2)
    );

    const next = [...points, newPoint];
    setPoints(next);
    setSelectedPointId(newPoint.id);
    saveGalleryPoints(selectedGalleryId, next);
  };

  // Delete a point
  const handleDeletePoint = (pointId: string) => {
    const next = points.filter((p) => p.id !== pointId);
    setPoints(next);
    if (selectedPointId === pointId) {
      setSelectedPointId(next.length > 0 ? next[0].id : null);
    }
    saveGalleryPoints(selectedGalleryId, next);
  };

  // Toggle point visibility in Admin Preview
  const handleToggleHidePoint = (pointId: string) => {
    setPoints((prev) =>
      prev.map((p) =>
        p.id === pointId ? { ...p, hiddenInAdminPreview: !p.hiddenInAdminPreview } : p
      )
    );
  };

  // Frame management for Collection Points
  const handleAddFrame = (colPoint: AdminCollectionPoint) => {
    const nextOrder = (colPoint.frames?.length || 0) + 1;
    const newFrame: ArtworkFrameConfig = {
      id: `${colPoint.id}-f${Date.now().toString().slice(-4)}`,
      order: nextOrder,
      x: 0,
      y: 0,
      scale: 1,
    };
    const updated: AdminCollectionPoint = {
      ...colPoint,
      frames: [...(colPoint.frames || []), newFrame],
    };
    handleUpdatePoint(updated);
  };

  const handleUpdateFrame = (
    colPoint: AdminCollectionPoint,
    frameIndex: number,
    updatedFrame: ArtworkFrameConfig
  ) => {
    const updatedFrames = [...colPoint.frames];
    updatedFrames[frameIndex] = updatedFrame;
    handleUpdatePoint({
      ...colPoint,
      frames: updatedFrames,
    });
  };

  const handleDeleteFrame = (colPoint: AdminCollectionPoint, frameIndex: number) => {
    if (colPoint.frames.length <= 1) {
      alert('حداقل یک قاب برای هر نقطه مجموعه مورد نیاز است.');
      return;
    }
    const updatedFrames = colPoint.frames.filter((_, idx) => idx !== frameIndex);
    handleUpdatePoint({
      ...colPoint,
      frames: updatedFrames,
    });
  };

  const handleMoveFrame = (
    colPoint: AdminCollectionPoint,
    fromIndex: number,
    toIndex: number
  ) => {
    if (toIndex < 0 || toIndex >= colPoint.frames.length) return;
    const updated = [...colPoint.frames];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    handleUpdatePoint({
      ...colPoint,
      frames: updated,
    });
  };

  const selectedPoint = points.find((p) => p.id === selectedPointId) || null;

  const filteredPoints = points.filter((p) => {
    if (activeTab === 'collection') {
      return p.type === 'collection' && (p as AdminCollectionPoint).pointType !== 'star';
    }
    if (activeTab === 'star') {
      return p.type === 'collection' && (p as AdminCollectionPoint).pointType === 'star';
    }
    if (activeTab === 'icon') return p.type === 'icon';
    if (activeTab === 'puzzle') return p.type === 'puzzle';
    return true;
  });

  return (
    <div className="h-screen w-full flex flex-col bg-[#f5f4f0] text-[#0e0f0f] select-none font-sans-custom overflow-hidden">
      {/* Top Admin Header Bar */}
      <header className="h-14 bg-white border-b border-[#0e0f0f] px-4 flex items-center justify-between z-40 shrink-0 shadow-xs">
        {/* Left: Branding & Section Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseAdmin}
            className="p-1.5 hover:bg-[#eae7e7] text-[#0e0f0f] flex items-center gap-1.5 text-xs font-mono-custom font-bold border border-[#0e0f0f] transition-colors cursor-pointer"
            title="Return to Game"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>خروج از ادمین</span>
          </button>

          <div className="h-5 w-px bg-[#0e0f0f]/20 mx-1 hidden sm:block" />

          {/* Section Switcher Tabs */}
          <div className="flex border border-[#0e0f0f] p-0.5 bg-white text-xs font-mono-custom">
            <button
              onClick={() => setAdminSection('map-points')}
              className={`px-3 py-1 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                adminSection === 'map-points'
                  ? 'bg-[#0e0f0f] text-white'
                  : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>نقشه و نقاط</span>
            </button>
            <button
              onClick={() => setAdminSection('arrows')}
              className={`px-3 py-1 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                adminSection === 'arrows'
                  ? 'bg-[#0e0f0f] text-white'
                  : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>مدیریت فلش‌ها (Arrows)</span>
            </button>
            <button
              onClick={() => setAdminSection('gallery-areas')}
              className={`px-3 py-1 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                adminSection === 'gallery-areas'
                  ? 'bg-[#0e0f0f] text-white'
                  : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>محدوده‌های گالری (Gallery Areas)</span>
            </button>
            <button
              onClick={() => setAdminSection('questions-artwork')}
              className={`px-3 py-1 font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                adminSection === 'questions-artwork'
                  ? 'bg-[#0e0f0f] text-white'
                  : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Gallery Questions Artwork</span>
            </button>
          </div>
        </div>

        {/* Center / Right: Gallery Selector or Map Actions */}
        {adminSection === 'map-points' ? (
          <>
            {/* Gallery Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-custom font-bold text-[#747878] uppercase hidden md:inline">
                گالری فعال:
              </span>
              <select
                value={selectedGalleryId}
                onChange={(e) => setSelectedGalleryId(e.target.value)}
                className="bg-[#fbf9f9] border border-[#0e0f0f] px-2.5 py-1 text-xs font-bold font-sans-custom cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0e0f0f]"
              >
                {GALLERIES.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nameFa} ({g.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Actions (Add Points, Save, Reset) */}
            <div className="flex items-center gap-2">
              {/* Add Type A */}
              <button
                onClick={handleAddCollectionPoint}
                className="px-2.5 py-1 bg-white border border-[#0e0f0f] hover:bg-[#eae7e7] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="افزودن نقطه مجموعه با قاب‌های هنری"
              >
                <MapPin className="w-3.5 h-3.5 text-[#0e0f0f]" />
                <span className="hidden sm:inline">+ نقطه مجموعه (Type A)</span>
                <span className="sm:hidden">+ مجموعه</span>
              </button>

              {/* Add Type B */}
              <button
                onClick={handleAddIconPoint}
                className="px-2.5 py-1 bg-white border border-[#0e0f0f] hover:bg-[#eae7e7] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="افزودن نقطه آیکون سفارشی بدون کادر اضافه"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#c5a059]" />
                <span className="hidden sm:inline">+ نقطه آیکون (Type B)</span>
                <span className="sm:hidden">+ آیکون</span>
              </button>

              {/* Add Puzzle Point */}
              <button
                onClick={handleAddPuzzlePoint}
                className="px-2.5 py-1 bg-white border border-[#0e0f0f] hover:bg-[#eae7e7] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="افزودن نقطه پازل تعاملی (Puzzle Point)"
              >
                <Puzzle className="w-3.5 h-3.5 text-[#3b82f6]" />
                <span className="hidden sm:inline">+ نقطه پازل</span>
                <span className="sm:hidden">+ پازل</span>
              </button>

              <div className="h-5 w-px bg-[#0e0f0f]/20 mx-1" />

              {/* Reset */}
              <button
                onClick={handleReset}
                className="p-1.5 hover:bg-red-50 text-red-700 border border-red-200 text-xs font-mono-custom transition-colors cursor-pointer"
                title="بازنشانی به تنظیمات اولیه"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Save Changes */}
              <button
                onClick={handleSave}
                className={`px-3 py-1 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isSaved
                    ? 'bg-emerald-600 text-white border border-emerald-700'
                    : 'bg-[#0e0f0f] text-white hover:bg-[#2a2b2b] border border-[#0e0f0f]'
                }`}
              >
                {isSaved ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>ذخیره شد!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>ذخیره تغییرات</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : adminSection === 'arrows' ? (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#0e0f0f] text-white text-[10px] font-mono-custom font-bold uppercase tracking-widest hidden sm:flex items-center gap-1">
              <Navigation className="w-3 h-3 text-[#c5a059]" />
              ویرایشگر و موقعیت‌یاب فلش‌های ناوبری (Arrow Management)
            </span>
          </div>
        ) : adminSection === 'gallery-areas' ? (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#0e0f0f] text-white text-[10px] font-mono-custom font-bold uppercase tracking-widest hidden sm:flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#c5a059]" />
              محدوده‌های گالری و موقعیت لامپ بازیکن (Gallery Areas & Player Location)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#0e0f0f] text-white text-[10px] font-mono-custom font-bold uppercase tracking-widest hidden sm:flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#c5a059]" />
              تنظیمات اثر هنری نهایی پرسش‌های گالری
            </span>
          </div>
        )}
      </header>

      {/* Main Workspace Layout */}
      {adminSection === 'questions-artwork' ? (
        <GalleryQuestionsArtworkEditor />
      ) : adminSection === 'arrows' ? (
        <AdminArrowEditor initialGalleryId={selectedGalleryId} />
      ) : adminSection === 'gallery-areas' ? (
        <AdminGalleryAreasEditor />
      ) : (
        <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Points List & Hierarchy (Width ~280px) */}
        <aside className="w-64 md:w-72 bg-white border-r border-[#0e0f0f] flex flex-col shrink-0 z-20">
          {/* Points List Header & Filter Tabs */}
          <div className="p-3 border-b border-[#0e0f0f]/20 space-y-2 bg-[#faf9f6]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono-custom uppercase tracking-wider text-[#0e0f0f]">
                نقاط موجود ({points.length})
              </span>
              <span className="text-[10px] font-mono-custom text-[#747878]">
                {currentGallery.name.split('—')[0]}
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex border border-[#0e0f0f] p-0.5 bg-white text-[10px] font-mono-custom">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-0.5 text-center font-bold transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#0e0f0f] text-white'
                    : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
                }`}
              >
                همه ({points.length})
              </button>
              <button
                onClick={() => setActiveTab('collection')}
                className={`flex-1 py-0.5 text-center font-bold transition-colors cursor-pointer ${
                  activeTab === 'collection'
                    ? 'bg-[#0e0f0f] text-white'
                    : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
                }`}
              >
                مجموعه
              </button>
              <button
                onClick={() => setActiveTab('star')}
                className={`flex-1 py-0.5 text-center font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                  activeTab === 'star'
                    ? 'bg-[#fbbf24] text-[#1e1b18]'
                    : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
                }`}
              >
                <Star className="w-2.5 h-2.5 fill-current" />
                <span>
                  ستاره ({points.filter((p) => p.type === 'collection' && (p as AdminCollectionPoint).pointType === 'star').length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab('icon')}
                className={`flex-1 py-0.5 text-center font-bold transition-colors cursor-pointer ${
                  activeTab === 'icon'
                    ? 'bg-[#0e0f0f] text-white'
                    : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
                }`}
              >
                آیکون
              </button>
              <button
                onClick={() => setActiveTab('puzzle')}
                className={`flex-1 py-0.5 text-center font-bold transition-colors cursor-pointer ${
                  activeTab === 'puzzle'
                    ? 'bg-[#0e0f0f] text-white'
                    : 'hover:bg-[#eae7e7] text-[#0e0f0f]'
                }`}
              >
                پازل
              </button>
            </div>
          </div>

          {/* Points List Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 divide-y divide-[#0e0f0f]/5">
            {filteredPoints.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#747878] font-mono-custom">
                هیچ نقطه‌ای در این بخش یافت نشد.
              </div>
            ) : (
              filteredPoints.map((pt) => {
                const isSelected = selectedPointId === pt.id;
                const isCollection = pt.type === 'collection';
                const isStar = isCollection && (pt as AdminCollectionPoint).pointType === 'star';
                const isPuzzle = pt.type === 'puzzle';

                return (
                  <div
                    key={pt.id}
                    onClick={() => setSelectedPointId(pt.id)}
                    className={`p-2.5 border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#0e0f0f] text-white border-[#0e0f0f] shadow-xs'
                        : 'bg-white hover:bg-[#f6f5f2] border-[#0e0f0f]/20 text-[#0e0f0f]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {isStar ? (
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-mono-custom font-bold ${
                            isSelected
                              ? 'border-[#fbbf24] bg-[#fbbf24] text-[#1e1b18]'
                              : 'border-[#fbbf24] bg-[#fef3c7] text-[#92400e]'
                          }`}
                          title="نقطه ستاره‌دار"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                      ) : isCollection ? (
                        <div
                          className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 text-[10px] font-mono-custom font-bold ${
                            isSelected
                              ? 'border-[#c5a059] bg-[#c5a059] text-[#0e0f0f]'
                              : 'border-[#0e0f0f] bg-[#fbf9f9] text-[#0e0f0f]'
                          }`}
                        >
                          {(pt as AdminCollectionPoint).frames?.length || 1}F
                        </div>
                      ) : isPuzzle ? (
                        <div
                          className={`w-6 h-6 border flex items-center justify-center shrink-0 text-[10px] font-mono-custom font-bold ${
                            isSelected
                              ? 'border-[#38bdf8] bg-[#38bdf8] text-[#0e0f0f]'
                              : 'border-[#0e0f0f] bg-[#3b82f6] text-white'
                          }`}
                        >
                          <Puzzle className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div
                          className={`w-6 h-6 border flex items-center justify-center shrink-0 text-[10px] font-mono-custom font-bold ${
                            isSelected
                              ? 'border-white bg-white text-[#0e0f0f]'
                              : 'border-[#0e0f0f] bg-[#0e0f0f] text-white'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate leading-tight flex items-center gap-1">
                          {isStar && <span className="text-[#fbbf24] font-mono-custom text-[11px]">★</span>}
                          <span className="truncate">{pt.title || pt.id}</span>
                        </div>
                        <div
                          className={`text-[10px] font-mono-custom flex items-center gap-2 mt-0.5 ${
                            isSelected ? 'text-[#c5a059]' : 'text-[#747878]'
                          }`}
                        >
                          <span>ID: {pt.id}</span>
                          <span>
                            X:{pt.x} Y:{pt.y}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Visibility Toggle & Delete */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleHidePoint(pt.id);
                        }}
                        title={pt.hiddenInAdminPreview ? 'نمایش در نقشه' : 'مخفی کردن در نقشه'}
                        className={`p-1 hover:bg-white/20 rounded-xs transition-colors ${
                          pt.hiddenInAdminPreview ? 'text-red-400' : ''
                        }`}
                      >
                        {pt.hiddenInAdminPreview ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePoint(pt.id);
                        }}
                        title="حذف این نقطه"
                        className="p-1 hover:bg-red-500 hover:text-white rounded-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Center: Interactive SVG Map Workspace */}
        <main className="flex-1 relative overflow-hidden bg-[#eeebe2]">
          <AdminMapCanvas
            gallery={currentGallery}
            points={points}
            selectedPointId={selectedPointId}
            onSelectPoint={(id) => setSelectedPointId(id)}
            onPointMove={handleUpdateCoordinates}
          />
        </main>

        {/* Right Side: Selected Point Properties & Frame Inspector (Width ~340px) */}
        <aside className="w-80 md:w-96 bg-white border-l border-[#0e0f0f] flex flex-col shrink-0 z-20 overflow-y-auto">
          {selectedPoint ? (
            <div className="p-4 space-y-4">
              {/* Point Type Header Badge */}
              <div className="flex items-center justify-between border-b border-[#0e0f0f]/20 pb-2">
                <div className="flex items-center gap-2">
                  {selectedPoint.type === 'collection' ? (
                    <span className="px-2 py-0.5 bg-[#0e0f0f] text-white text-[10px] font-mono-custom font-bold uppercase">
                      نقطه اثر هنری (Type A — Collection Point)
                    </span>
                  ) : selectedPoint.type === 'puzzle' ? (
                    <span className="px-2 py-0.5 bg-[#3b82f6] text-white text-[10px] font-mono-custom font-bold uppercase flex items-center gap-1">
                      <Puzzle className="w-3 h-3 text-white" />
                      نقطه پازل (Puzzle Point)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-[#c5a059] text-[#0e0f0f] text-[10px] font-mono-custom font-bold uppercase">
                      نقطه آیکون سفارشی (Type B — Icon Point)
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleDeletePoint(selectedPoint.id)}
                  className="text-xs font-mono-custom text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>حذف</span>
                </button>
              </div>

              {/* General Properties: Title, ID, Room */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                    عنوان نقطه (Title / Label)
                  </label>
                  <input
                    type="text"
                    value={selectedPoint.title}
                    onChange={(e) =>
                      handleUpdatePoint({ ...selectedPoint, title: e.target.value })
                    }
                    className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0e0f0f]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                      شناسه نقطه (Point ID)
                    </label>
                    <input
                      type="text"
                      value={selectedPoint.id}
                      disabled
                      className="w-full bg-[#eae7e7] border border-[#0e0f0f]/30 px-2 py-1 text-xs font-mono-custom text-[#747878]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                      گالری (Gallery)
                    </label>
                    <input
                      type="text"
                      value={selectedPoint.galleryId}
                      disabled
                      className="w-full bg-[#eae7e7] border border-[#0e0f0f]/30 px-2 py-1 text-xs font-mono-custom text-[#747878]"
                    />
                  </div>
                </div>

                {/* SVG Coordinates (X, Y) Numeric Inputs */}
                <div className="p-3 bg-[#faf9f6] border border-[#0e0f0f]/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono-custom uppercase text-[#0e0f0f] flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-[#c5a059]" /> مختصات نقشه (SVG Coordinates)
                    </span>
                    <span className="text-[10px] font-mono-custom text-[#747878]">
                      بزرگنمایی مستقل
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono-custom text-[#747878] mb-0.5">
                        موقعیت افقی X (0..{currentGallery.width})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={currentGallery.width}
                        value={selectedPoint.x}
                        onChange={(e) =>
                          handleUpdateCoordinates(
                            selectedPoint.id,
                            parseInt(e.target.value, 10) || 0,
                            selectedPoint.y
                          )
                        }
                        className="w-full bg-white border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono-custom text-[#747878] mb-0.5">
                        موقعیت عمودی Y (0..{currentGallery.height})
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={currentGallery.height}
                        value={selectedPoint.y}
                        onChange={(e) =>
                          handleUpdateCoordinates(
                            selectedPoint.id,
                            selectedPoint.x,
                            parseInt(e.target.value, 10) || 0
                          )
                        }
                        className="w-full bg-white border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* SPECIFIC PROPERTIES FOR TYPE A: COLLECTION POINT */}
                {selectedPoint.type === 'collection' && (
                  <>
                    {/* Point Type Selector (Normal vs Star) */}
                    <div>
                      <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                        نوع نقطه (Point Type)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              pointType: 'normal',
                            })
                          }
                          className={`px-3 py-2 border text-xs font-bold font-mono-custom flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            (selectedPoint as AdminCollectionPoint).pointType !== 'star'
                              ? 'bg-[#0e0f0f] text-white border-[#0e0f0f] shadow-xs'
                              : 'bg-white text-[#0e0f0f] border-[#0e0f0f]/30 hover:border-[#0e0f0f]'
                          }`}
                        >
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center">
                            <div className="w-1 h-1 rounded-full bg-current" />
                          </div>
                          <span>عادی (Normal)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              pointType: 'star',
                            })
                          }
                          className={`px-3 py-2 border text-xs font-bold font-mono-custom flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            (selectedPoint as AdminCollectionPoint).pointType === 'star'
                              ? 'bg-[#fbbf24] text-[#1e1b18] border-[#1e1b18] shadow-xs ring-1 ring-[#1e1b18]'
                              : 'bg-white text-[#0e0f0f] border-[#0e0f0f]/30 hover:border-[#0e0f0f]'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current text-current" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                          <span>ستاره‌دار (Star)</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                          کد اتاق (Room Code)
                        </label>
                        <input
                          type="text"
                          value={(selectedPoint as AdminCollectionPoint).roomCode || ''}
                          onChange={(e) =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              roomCode: e.target.value,
                            })
                          }
                          className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                          جهت باز شدن (Reveal Direction)
                        </label>
                        <select
                          value={(selectedPoint as AdminCollectionPoint).direction || 'left'}
                          onChange={(e) =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              direction: e.target.value as any,
                            })
                          }
                          className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2 py-1 text-xs font-sans-custom cursor-pointer"
                        >
                          <option value="left">چپ به راست (Left to Right)</option>
                          <option value="right">راست به چپ (Right to Left)</option>
                          <option value="top">بالا به پایین (Top to Bottom)</option>
                          <option value="bottom">پایین به بالا (Bottom to Top)</option>
                        </select>
                      </div>
                    </div>

                    {/* Star ID display / editor if this is a Star Point */}
                    {(selectedPoint as AdminCollectionPoint).pointType === 'star' && (
                      <div>
                        <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                          شناسه محتوای ستاره (Star ID)
                        </label>
                        <input
                          type="text"
                          value={(selectedPoint as AdminCollectionPoint).starId || ''}
                          onChange={(e) =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              starId: e.target.value,
                            })
                          }
                          placeholder="مثال: star-01"
                          className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom"
                        />
                      </div>
                    )}

                    {/* Artwork Frames Configuration Section */}
                    <div className="pt-2 border-t border-[#0e0f0f]/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold font-mono-custom uppercase tracking-wide text-[#0e0f0f] flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-[#0e0f0f]" />
                            قاب‌های اثر هنری ({(selectedPoint as AdminCollectionPoint).frames?.length || 0} قاب)
                          </h4>
                          <p className="text-[10px] text-[#747878] font-mono-custom mt-0.5">
                            تنظیم تصویر و موقعیت مستقل برای هر قاب
                          </p>
                        </div>

                        <button
                          onClick={() => handleAddFrame(selectedPoint as AdminCollectionPoint)}
                          className="px-2 py-1 bg-white border border-[#0e0f0f] hover:bg-[#0e0f0f] hover:text-white transition-colors text-xs font-bold font-mono-custom flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>افزودن قاب</span>
                        </button>
                      </div>

                      {/* List of Frames */}
                      <div className="space-y-3">
                        {(selectedPoint as AdminCollectionPoint).frames?.map((frame, fIdx) => (
                          <ArtworkFrameEditor
                            key={frame.id || fIdx}
                            frame={frame}
                            frameIndex={fIdx}
                            totalFrames={(selectedPoint as AdminCollectionPoint).frames.length}
                            onUpdate={(updated) =>
                              handleUpdateFrame(
                                selectedPoint as AdminCollectionPoint,
                                fIdx,
                                updated
                              )
                            }
                            onDelete={() =>
                              handleDeleteFrame(
                                selectedPoint as AdminCollectionPoint,
                                fIdx
                              )
                            }
                            onMoveUp={() =>
                              handleMoveFrame(
                                selectedPoint as AdminCollectionPoint,
                                fIdx,
                                fIdx - 1
                              )
                            }
                            onMoveDown={() =>
                              handleMoveFrame(
                                selectedPoint as AdminCollectionPoint,
                                fIdx,
                                fIdx + 1
                              )
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* SPECIFIC PROPERTIES FOR TYPE B: CUSTOM ICON POINT */}
                {selectedPoint.type === 'icon' && (
                  <div className="pt-2 border-t border-[#0e0f0f]/20 space-y-3">
                    <h4 className="text-xs font-bold font-mono-custom uppercase tracking-wide text-[#0e0f0f] flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#c5a059]" />
                      تنظیمات آیکون و مقصد تعاملی (Type B Settings)
                    </h4>

                    {/* Icon Type Selection */}
                    <div>
                      <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                        نوع آیکون (Icon Style)
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          onClick={() =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              iconType: 'preset-question',
                            })
                          }
                          className={`p-2 border text-center flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                            (selectedPoint as AdminIconPoint).iconType === 'preset-question'
                              ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                              : 'bg-white hover:bg-[#eae7e7] border-[#0e0f0f]/30 text-[#0e0f0f]'
                          }`}
                        >
                          <span>کاغذ راهنما (?)</span>
                        </button>

                        <button
                          onClick={() =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              iconType: 'preset-door',
                            })
                          }
                          className={`p-2 border text-center flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                            (selectedPoint as AdminIconPoint).iconType === 'preset-door'
                              ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                              : 'bg-white hover:bg-[#eae7e7] border-[#0e0f0f]/30 text-[#0e0f0f]'
                          }`}
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>ورودی / درب</span>
                        </button>

                        <button
                          onClick={() =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              iconType: 'preset-star',
                            })
                          }
                          className={`p-2 border text-center flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                            (selectedPoint as AdminIconPoint).iconType === 'preset-star'
                              ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                              : 'bg-white hover:bg-[#eae7e7] border-[#0e0f0f]/30 text-[#0e0f0f]'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                          <span>رویداد ویژه (ستاره)</span>
                        </button>

                        <button
                          onClick={() =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              iconType: 'preset-location-frame',
                            })
                          }
                          className={`p-2 border text-center flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                            (selectedPoint as AdminIconPoint).iconType === 'preset-location-frame'
                              ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                              : 'bg-white hover:bg-[#eae7e7] border-[#0e0f0f]/30 text-[#0e0f0f]'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#fbbf24]" />
                          <span>پین لوکیشن (قاب/فریم)</span>
                        </button>

                        <button
                          onClick={() =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              iconType: 'preset-location-coffee',
                            })
                          }
                          className={`p-2 border text-center flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                            (selectedPoint as AdminIconPoint).iconType === 'preset-location-coffee'
                              ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                              : 'bg-white hover:bg-[#eae7e7] border-[#0e0f0f]/30 text-[#0e0f0f]'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#f59e0b]" />
                          <span>پین لوکیشن (کافه)</span>
                        </button>

                        <button
                          onClick={() =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              iconType: 'preset-location-shop',
                            })
                          }
                          className={`p-2 border text-center flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                            (selectedPoint as AdminIconPoint).iconType === 'preset-location-shop'
                              ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                              : 'bg-white hover:bg-[#eae7e7] border-[#0e0f0f]/30 text-[#0e0f0f]'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-[#ea580c]" />
                          <span>پین لوکیشن (فروشگاه)</span>
                        </button>

                        <button
                          onClick={() =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              iconType: 'preset-location-tree',
                            })
                          }
                          className={`p-2 border text-center flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                            (selectedPoint as AdminIconPoint).iconType === 'preset-location-tree'
                              ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                              : 'bg-white hover:bg-[#eae7e7] border-[#0e0f0f]/30 text-[#0e0f0f]'
                          }`}
                        >
                          <Trees className="w-3.5 h-3.5 text-emerald-600" />
                          <span>پین لوکیشن (درخت / باغ)</span>
                        </button>

                        <button
                          onClick={() =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              iconType: 'upload',
                            })
                          }
                          className={`p-2 border text-center flex items-center justify-center gap-1.5 cursor-pointer font-bold ${
                            (selectedPoint as AdminIconPoint).iconType === 'upload'
                              ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                              : 'bg-white hover:bg-[#eae7e7] border-[#0e0f0f]/30 text-[#0e0f0f]'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>بارگذاری سفارشی</span>
                        </button>
                      </div>
                    </div>

                    {/* Upload Custom Icon if type is upload */}
                    {(selectedPoint as AdminIconPoint).iconType === 'upload' && (
                      <div className="p-3 bg-[#faf9f6] border border-[#0e0f0f]/20 space-y-2">
                        <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase">
                          فایل آیکون (SVG, PNG, WebP)
                        </label>
                        <input
                          type="file"
                          accept=".svg,image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              handleUpdatePoint({
                                ...selectedPoint,
                                iconData: ev.target?.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="text-xs w-full cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Icon Dimensions */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                          عرض آیکون (Width px)
                        </label>
                        <input
                          type="number"
                          min="16"
                          max="200"
                          value={(selectedPoint as AdminIconPoint).width}
                          onChange={(e) =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              width: parseInt(e.target.value, 10) || 36,
                            })
                          }
                          className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                          ارتفاع آیکون (Height px)
                        </label>
                        <input
                          type="number"
                          min="16"
                          max="200"
                          value={(selectedPoint as AdminIconPoint).height}
                          onChange={(e) =>
                            handleUpdatePoint({
                              ...selectedPoint,
                              height: parseInt(e.target.value, 10) || 36,
                            })
                          }
                          className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2 py-1 text-xs font-mono-custom font-bold"
                        />
                      </div>
                    </div>

                    {/* Destination Route */}
                    <div>
                      <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                        صفحه مقصد هنگام کلیک (Destination Screen)
                      </label>
                      <select
                        value={(selectedPoint as AdminIconPoint).destination}
                        onChange={(e) =>
                          handleUpdatePoint({
                            ...selectedPoint,
                            destination: e.target.value as any,
                          })
                        }
                        className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2.5 py-1.5 text-xs font-bold font-sans-custom cursor-pointer"
                      >
                        <option value="gallery-01-questions">
                          پرسش‌های گالری ۰۱ (Gallery 01 Questions & Quiz)
                        </option>
                        <option value="gallery-00">گالری ۰۰ (Gallery 00 Museum Archive)</option>
                        <option value="gallery-01">گالری ۰۱ (Gallery 01 Architectural Hall)</option>
                        <option value="gallery-02">گالری ۰۲ (Gallery 02 Vault Pavilion)</option>
                        <option value="gallery-03">گالری ۰۳ (Gallery 03 Modern Hall)</option>
                        <option value="gallery-04">گالری ۰۴ (Gallery 04)</option>
                        <option value="gallery-05">گالری ۰۵ (Gallery 05)</option>
                        <option value="gallery-06">گالری ۰۶ (Gallery 06)</option>
                        <option value="gallery-07">گالری ۰۷ (Gallery 07)</option>
                        <option value="gallery-08">گالری ۰۸ (Gallery 08)</option>
                        <option value="gallery-09">گالری ۰۹ (Gallery 09)</option>
                        <option value="collection">نمای فهرست مجموعه‌ها (Collection Index)</option>
                        <option value="curator">یادداشت‌های کیوریتور (Curator Logbook)</option>
                        <option value="tasks">وظایف و ماموریت‌ها (Tasks View)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* SPECIFIC PROPERTIES FOR PUZZLE POINT */}
                {selectedPoint.type === 'puzzle' && (
                  <div className="border-t border-[#0e0f0f]/20 pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0e0f0f]">
                      <Puzzle className="w-4 h-4 text-[#3b82f6]" />
                      <span>تنظیمات سوال و پاداش پازل (Puzzle Settings)</span>
                    </div>

                    {/* Question ID */}
                    <div>
                      <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                        شناسه سوال (Question ID)
                      </label>
                      <input
                        type="text"
                        value={(selectedPoint as AdminPuzzlePoint).questionId}
                        onChange={(e) =>
                          handleUpdatePoint({
                            ...selectedPoint,
                            questionId: e.target.value,
                          })
                        }
                        placeholder="gallery01-puzzle-q01"
                        className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2.5 py-1.5 text-xs font-mono-custom font-bold focus:outline-none focus:ring-1 focus:ring-[#0e0f0f]"
                      />
                      <p className="text-[10px] text-[#747878] mt-1 font-mono-custom">
                        شناسه سوال متناظر برای نمایش در آزمون تک‌سوالی این نقطه
                      </p>
                    </div>

                    {/* Puzzle Piece ID */}
                    <div>
                      <label className="block text-[11px] font-bold font-mono-custom text-[#747878] uppercase mb-1">
                        شناسه قطعه پازل پاداش (Puzzle Piece ID)
                      </label>
                      <input
                        type="text"
                        value={(selectedPoint as AdminPuzzlePoint).puzzlePieceId}
                        onChange={(e) =>
                          handleUpdatePoint({
                            ...selectedPoint,
                            puzzlePieceId: e.target.value,
                          })
                        }
                        placeholder="gallery01-piece-01"
                        className="w-full bg-[#fbf9f9] border border-[#0e0f0f] px-2.5 py-1.5 text-xs font-mono-custom font-bold focus:outline-none focus:ring-1 focus:ring-[#0e0f0f]"
                      />
                      <p className="text-[10px] text-[#747878] mt-1 font-mono-custom">
                        شناسه قطعه پازلی که با پاسخ صحیح به کاربر اعطا و قفل آن باز می‌شود
                      </p>
                    </div>

                    {/* Active / Inactive Toggle */}
                    <div className="p-3 bg-[#faf9f6] border border-[#0e0f0f]/20 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-[#0e0f0f]">وضعیت فعالیت در نقشه</div>
                        <div className="text-[10px] text-[#747878] font-mono-custom">
                          آیا این نقطه پازل برای کاربران قابل کلیک و فعال است؟
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdatePoint({
                            ...selectedPoint,
                            isActive: (selectedPoint as AdminPuzzlePoint).isActive === false ? true : false,
                          })
                        }
                        className={`px-3 py-1 text-xs font-bold font-mono-custom border transition-colors cursor-pointer ${
                          (selectedPoint as AdminPuzzlePoint).isActive !== false
                            ? 'bg-[#0e0f0f] text-white border-[#0e0f0f]'
                            : 'bg-white text-[#747878] border-[#0e0f0f]/30 hover:bg-gray-100'
                        }`}
                      >
                        {(selectedPoint as AdminPuzzlePoint).isActive !== false ? 'فعال (Active)' : 'غیرفعال (Disabled)'}
                      </button>
                    </div>

                    {/* Info Card */}
                    <div className="p-3 bg-blue-50/60 border border-blue-200 text-xs text-blue-950 space-y-1">
                      <div className="font-bold flex items-center gap-1 text-blue-900">
                        <Info className="w-3.5 h-3.5" />
                        <span>سیستم پازل گالری</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        این نقطه به صورت خودکار وضعیت پیشرفت کاربر را از حافظه ذخیره‌شده بازی بررسی می‌کند. پس از پاسخ صحیح، تیک سبزرنگ تکمیل روی نشانگر نمایش می‌یابد.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#747878] my-auto space-y-2">
              <Layers className="w-8 h-8 mx-auto text-[#747878]/50" />
              <p className="text-xs font-bold text-[#0e0f0f]">نقطه‌ای انتخاب نشده است</p>
              <p className="text-[11px] font-mono-custom">
                یک نقطه را از لیست سمت چپ یا مستقیماً روی نقشه انتخاب کنید تا ویژگی‌های آن نمایش داده شود.
              </p>
            </div>
          )}
        </aside>
      </div>
      )}
    </div>
  );
};
