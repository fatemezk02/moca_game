/**
 * Legacy compatibility store proxying directly to the single source of truth:
 * src/data/mapConfig.ts
 */
export {
  GALLERIES,
  DEFAULT_MAP_DATABASE,
  getGalleryMapConfig,
  getAllGalleryMapConfigs,
  getGalleryPoints,
  getGalleryCollectionPoints,
  getGalleryIconPoints,
  saveGalleryPoints,
  saveGalleryConfig,
  resetGalleryPoints,
  resetGalleryMapConfig,
  resetAllGalleries,
} from './mapConfig';

import {
  AdminMapPoint,
  AdminCollectionPoint,
  AdminIconPoint,
} from '../types/admin';
import {
  getAllGalleryMapConfigs,
  getGalleryPoints,
  saveGalleryPoints,
  resetGalleryPoints,
} from './mapConfig';

export function getAllPointsFromStorage(): Record<string, AdminMapPoint[]> {
  const allConfigs = getAllGalleryMapConfigs();
  const res: Record<string, AdminMapPoint[]> = {};
  for (const [gId, conf] of Object.entries(allConfigs)) {
    res[gId] = [...conf.collectionPoints, ...conf.iconPoints];
  }
  return res;
}
