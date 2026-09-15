/**
 * Legacy compatibility store proxying directly to the single source of truth:
 * src/data/mapConfig.ts
 */
export {
  getGalleryArrows,
  saveGalleryArrows,
  resetGalleryArrows,
  createNewArrow,
} from './mapConfig';

import { AdminArrowPoint } from '../types/admin';
import {
  getAllGalleryMapConfigs,
  getGalleryArrows,
  saveGalleryArrows,
  resetGalleryArrows,
  createNewArrow,
} from './mapConfig';

export const DEFAULT_GALLERY_ARROWS: Record<string, AdminArrowPoint[]> = {
  'gallery-00': [
    {
      id: 'arrow-g00-to-g01',
      type: 'arrow',
      galleryId: 'gallery-00',
      title: 'فلش راهنما به گالری ۰۱',
      x: 240,
      y: 583,
      rotation: 0,
      size: 48,
      destination: 'gallery-01',
    },
  ],
  'gallery-01': [],
  'gallery-03': [],
};

export function loadAllArrows(): Record<string, AdminArrowPoint[]> {
  const allConfigs = getAllGalleryMapConfigs();
  const res: Record<string, AdminArrowPoint[]> = {};
  for (const [gId, conf] of Object.entries(allConfigs)) {
    res[gId] = conf.arrows || [];
  }
  return res;
}
