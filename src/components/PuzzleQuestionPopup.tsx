import React from 'react';
import { PuzzlePointModal } from './PuzzlePointModal';
import { AdminPuzzlePoint } from '../types/admin';

export interface PuzzleQuestionPopupProps {
  galleryId: string;
  puzzlePoint: AdminPuzzlePoint | null;
  onClose: () => void;
}

/**
 * Shared reusable PuzzleQuestionPopup component.
 * Provides visually and behaviorally identical puzzle question popup across all galleries.
 */
export const PuzzleQuestionPopup: React.FC<PuzzleQuestionPopupProps> = (props) => {
  return <PuzzlePointModal {...props} />;
};

export default PuzzleQuestionPopup;
