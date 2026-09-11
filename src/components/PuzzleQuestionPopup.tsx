import React from 'react';
import {
  PuzzleQuestionModal,
  PuzzleQuestionModalProps,
} from './PuzzleQuestionModal';

export type PuzzleQuestionPopupProps = PuzzleQuestionModalProps;

/**
 * Standard shared Puzzle Question Modal wrapper.
 * Directly renders the unified PuzzleQuestionModal for all galleries.
 */
export const PuzzleQuestionPopup: React.FC<PuzzleQuestionPopupProps> = (
  props
) => {
  return <PuzzleQuestionModal {...props} />;
};

export default PuzzleQuestionPopup;
